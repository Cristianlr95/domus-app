import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UsersApiService } from '../../services/users-api.service';
import { User, UserFilter, UserRole } from '../../models/user.models';
import { ToastController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.page.html',
  styleUrls: ['./users-list.page.scss'],
})
export class UsersListPage implements OnInit, OnDestroy {
  users: User[] = [];
  isLoading = false;
  selectedRole: UserRole | '' = '';
  showActive: boolean | null = null;
  searchTerm = '';
  private destroy$ = new Subject<void>();

  userRoles: UserRole[] = [
    'ADMIN',
    'CONSERJERIA',
    'RESIDENTE',
    'MANTENIMIENTO',
  ];

  constructor(
    private usersApiService: UsersApiService,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController,
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers(): void {
    this.isLoading = true;
    const filter: UserFilter = {
      role: this.selectedRole,
      active: this.showActive || undefined,
      search: this.searchTerm,
    };

    this.usersApiService
      .list(filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.users = data;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading users:', error);
          this.isLoading = false;
          this.showErrorToast('Error al cargar usuarios');
        },
      });
  }

  onFilterChange(): void {
    this.loadUsers();
  }

  onSearch(event: any): void {
    this.searchTerm = event.target.value;
    this.loadUsers();
  }

  viewDetails(userId: string): void {
    this.router.navigate(['/users', userId]);
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
}
