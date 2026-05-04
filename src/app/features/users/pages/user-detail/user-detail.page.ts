import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UsersApiService } from '../../services/users-api.service';
import { User, UserRole } from '../../models/user.models';
import {
  ToastController,
  AlertController,
  LoadingController,
} from '@ionic/angular';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.page.html',
  styleUrls: ['./user-detail.page.scss'],
})
export class UserDetailPage implements OnInit, OnDestroy {
  user: User | null = null;
  isLoading = false;
  isUpdating = false;
  selectedRole: UserRole | null = null;
  userRoles: UserRole[] = [
    'ADMIN',
    'CONSERJERIA',
    'RESIDENTE',
    'MANTENIMIENTO',
  ];
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usersApiService: UsersApiService,
    private toastController: ToastController,
    private alertController: AlertController,
    private loadingController: LoadingController,
  ) {}

  ngOnInit(): void {
    this.loadUser();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUser(): void {
    this.isLoading = true;
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.router.navigate(['/users']);
      return;
    }

    this.usersApiService
      .getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.user = data;
          this.selectedRole = data.role;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading user:', error);
          this.isLoading = false;
          this.showErrorToast('Error al cargar usuario');
          this.router.navigate(['/users']);
        },
      });
  }

  async updateRole(): Promise<void> {
    if (!this.user || !this.selectedRole) {
      return;
    }

    const alert = await this.alertController.create({
      header: 'Cambiar rol',
      message: `¿Deseas cambiar el rol de este usuario a ${this.getRoleLabel(this.selectedRole)}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Confirmar',
          handler: () => {
            this.performRoleUpdate();
          },
        },
      ],
    });
    await alert.present();
  }

  private async performRoleUpdate(): Promise<void> {
    if (!this.user || !this.selectedRole) {
      return;
    }

    this.isUpdating = true;
    const loading = await this.loadingController.create({
      message: 'Actualizando rol...',
    });
    await loading.present();

    this.usersApiService
      .update(this.user.id, { role: this.selectedRole })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          loading.dismiss();
          this.isUpdating = false;
          this.user = updated;
          this.showSuccessToast('Rol actualizado');
        },
        error: (error) => {
          loading.dismiss();
          this.isUpdating = false;
          console.error('Error updating role:', error);
          this.showErrorToast('Error al actualizar rol');
        },
      });
  }

  async toggleActive(): Promise<void> {
    if (!this.user) {
      return;
    }

    const action = this.user.active ? 'desactivar' : 'activar';
    const alert = await this.alertController.create({
      header: `${action.charAt(0).toUpperCase()}${action.slice(1)} usuario`,
      message: `¿Estás seguro de que deseas ${action} a este usuario?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: `${action.charAt(0).toUpperCase()}${action.slice(1)}`,
          handler: () => {
            this.performToggle();
          },
        },
      ],
    });
    await alert.present();
  }

  private async performToggle(): Promise<void> {
    if (!this.user) {
      return;
    }

    this.isUpdating = true;
    const loading = await this.loadingController.create({
      message: this.user.active ? 'Desactivando...' : 'Activando...',
    });
    await loading.present();

    const action = this.user.active
      ? this.usersApiService.deactivate(this.user.id)
      : this.usersApiService.activate(this.user.id);

    action.pipe(takeUntil(this.destroy$)).subscribe({
      next: (updated) => {
        loading.dismiss();
        this.isUpdating = false;
        this.user = updated;
        this.showSuccessToast(
          `Usuario ${updated.active ? 'activado' : 'desactivado'}`,
        );
      },
      error: (error) => {
        loading.dismiss();
        this.isUpdating = false;
        console.error('Error toggling user:', error);
        this.showErrorToast('Error al actualizar estado');
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }

  getRoleColor(role: UserRole): string {
    switch (role) {
      case 'ADMIN':
        return 'danger';
      case 'CONSERJERIA':
        return 'primary';
      case 'RESIDENTE':
        return 'secondary';
      case 'MANTENIMIENTO':
        return 'warning';
      default:
        return 'medium';
    }
  }

  getRoleLabel(role: UserRole): string {
    const labels: Record<UserRole, string> = {
      ADMIN: 'Administrador',
      CONSERJERIA: 'Conserjería',
      RESIDENTE: 'Residente',
      MANTENIMIENTO: 'Mantenimiento',
    };
    return labels[role] || role;
  }

  private async showErrorToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
      color: 'danger',
    });
    await toast.present();
  }

  private async showSuccessToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color: 'success',
    });
    await toast.present();
  }
}
