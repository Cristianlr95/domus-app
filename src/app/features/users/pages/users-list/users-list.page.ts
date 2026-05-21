import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AlertController } from '@ionic/angular';
import { AuthorizationService } from '../../../../core/auth/authorization.service';
import { PERMISSIONS } from '../../../../core/auth/auth.models';
import { AuthService } from '../../../../core/auth/auth.service';
import { FeedbackService } from '../../../../core/services/feedback.service';
import { User, UserFilter, UserRole } from '../../models/user.models';
import { UsersApiService } from '../../services/users-api.service';

@Component({
  selector: 'app-users-list-page',
  templateUrl: './users-list.page.html',
  styleUrls: ['./users-list.page.scss'],
  standalone: false,
})
export class UsersListPage {
  private readonly usersApiService = inject(UsersApiService);
  private readonly feedbackService = inject(FeedbackService);
  private readonly alertController = inject(AlertController);
  private readonly authService = inject(AuthService);
  private readonly authorizationService = inject(AuthorizationService);
  private readonly router = inject(Router);

  readonly userRoles: UserRole[] = ['ADMIN', 'CONSERJERIA', 'RESIDENTE'];

  users: User[] = [];
  loading = false;
  selectedRole: UserRole | '' = '';
  searchTerm = '';
  showInactive = false;
  private searchDebounce?: ReturnType<typeof setTimeout>;

  get canManageUsers(): boolean {
    return this.authorizationService.hasPermission(PERMISSIONS.USERS_MANAGE);
  }

  ionViewWillEnter(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    const filter: UserFilter = {
      role: this.selectedRole || undefined,
      active: this.showInactive ? undefined : true,
      search: this.searchTerm,
    };

    this.usersApiService
      .list(filter)
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: (users) => {
          this.users = users;
        },
        error: async (error) => {
          await this.feedbackService.error(this.authService.getErrorMessage(error));
        },
      });
  }

  onFilterChange(): void {
    this.loadUsers();
  }

  onSearchInput(): void {
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => this.loadUsers(), 300);
  }

  openDetail(userId: string): void {
    void this.router.navigate(['/users', userId]);
  }

  createUser(): void {
    if (!this.canManageUsers) {
      return;
    }

    void this.router.navigate(['/users/new']);
  }

  async toggleUserStatus(user: User): Promise<void> {
    if (!this.canManageUsers) {
      return;
    }

    const action = user.active ? 'desactivar' : 'activar';
    const alert = await this.alertController.create({
      header: `${action.charAt(0).toUpperCase()}${action.slice(1)} usuario`,
      message: `Deseas ${action} a ${user.firstName} ${user.lastName}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          handler: () => {
            const request = user.active
              ? this.usersApiService.deactivate(user.id)
              : this.usersApiService.activate(user.id);

            request.subscribe({
              next: () => {
                void this.feedbackService.success(`Usuario ${user.active ? 'desactivado' : 'activado'} correctamente`);
                this.loadUsers();
              },
              error: async (error) => {
                await this.feedbackService.error(this.authService.getErrorMessage(error));
              },
            });
          },
        },
      ],
    });
    await alert.present();
  }

  trackByUser(_index: number, user: User): string {
    return user.id;
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

  initials(user: User): string {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }
}
