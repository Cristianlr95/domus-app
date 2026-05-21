import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthorizationService } from '../../../../core/auth/authorization.service';
import { PERMISSIONS } from '../../../../core/auth/auth.models';
import { AuthService } from '../../../../core/auth/auth.service';
import { FeedbackService } from '../../../../core/services/feedback.service';
import { CreateUserRequest, User, UserRole, UpdateUserRequest } from '../../models/user.models';
import { UsersApiService } from '../../services/users-api.service';

@Component({
  selector: 'app-user-detail-page',
  templateUrl: './user-detail.page.html',
  styleUrls: ['./user-detail.page.scss'],
  standalone: false,
})
export class UserDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly usersApiService = inject(UsersApiService);
  private readonly feedbackService = inject(FeedbackService);
  private readonly authService = inject(AuthService);
  private readonly authorizationService = inject(AuthorizationService);
  private readonly fb = inject(FormBuilder);

  readonly userRoles: UserRole[] = ['ADMIN', 'CONSERJERIA', 'RESIDENTE'];

  user: User | null = null;
  form: FormGroup | null = null;
  loading = false;
  mutating = false;

  get canManageUsers(): boolean {
    return this.authorizationService.hasPermission(PERMISSIONS.USERS_MANAGE);
  }

  ionViewWillEnter(): void {
    this.loadUser();
  }

  loadUser(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (!userId || userId === 'new') {
      if (!this.canManageUsers) {
        void this.router.navigate(['/users']);
        return;
      }

      this.user = null;
      this.form = this.createForm();
      return;
    }

    this.loading = true;
    this.usersApiService
      .getById(userId)
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: (user) => {
        this.user = user;
        this.form = this.createForm(user);
        if (!this.canManageUsers) {
          this.form.disable();
        }
        },
        error: async (error) => {
          await this.feedbackService.error(this.authService.getErrorMessage(error));
          await this.router.navigate(['/users']);
        },
      });
  }

  createForm(user?: User): FormGroup {
    if (user) {
      return this.fb.group({
        firstName: [user.firstName, [Validators.required, Validators.minLength(2)]],
        lastName: [user.lastName, [Validators.required, Validators.minLength(2)]],
        role: [this.primaryRole(user), Validators.required],
      });
    }

    return this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      role: ['', Validators.required],
    });
  }

  saveUser(): void {
    if (!this.canManageUsers || !this.form || this.form.invalid || this.mutating) {
      this.form?.markAllAsTouched();
      return;
    }

    this.mutating = true;
    if (this.user) {
      this.updateUser();
      return;
    }

    this.createUser();
  }

  private updateUser(): void {
    if (!this.user || !this.form) {
      return;
    }

    const request: UpdateUserRequest = {
      firstName: this.form.get('firstName')?.value,
      lastName: this.form.get('lastName')?.value,
      role: this.form.get('role')?.value,
    };

    this.usersApiService
      .update(this.user.id, request)
      .pipe(finalize(() => {
        this.mutating = false;
      }))
      .subscribe({
        next: async (user) => {
          this.user = user;
          await this.feedbackService.success('Usuario actualizado correctamente');
          await this.router.navigate(['/users']);
        },
        error: async (error) => {
          await this.feedbackService.error(this.authService.getErrorMessage(error));
        },
      });
  }

  private createUser(): void {
    if (!this.form) {
      return;
    }

    const request = this.form.getRawValue() as CreateUserRequest;
    this.usersApiService
      .create(request)
      .pipe(finalize(() => {
        this.mutating = false;
      }))
      .subscribe({
        next: async () => {
          await this.feedbackService.success('Usuario creado correctamente');
          await this.router.navigate(['/users']);
        },
        error: async (error) => {
          await this.feedbackService.error(this.authService.getErrorMessage(error));
        },
      });
  }

  roleLabel(role: UserRole): string {
    const labels: Record<UserRole, string> = {
      ADMIN: 'Administrador',
      CONSERJERIA: 'Conserjeria',
      RESIDENTE: 'Residente',
    };
    return labels[role] || role;
  }

  primaryRole(user: User): UserRole {
    return user.roles[0] ?? 'RESIDENTE';
  }
}
