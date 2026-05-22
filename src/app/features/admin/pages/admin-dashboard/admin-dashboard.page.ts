import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { FeedbackService } from '../../../../core/services/feedback.service';
import { AdminDashboard, AdminRecentActivity } from '../../models/admin-dashboard.models';
import { AdminApiService } from '../../services/admin-api.service';

interface MetricTile {
  label: string;
  value: number;
  icon: string;
  route?: string;
}

@Component({
  selector: 'app-admin-dashboard-page',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
  standalone: false,
})
export class AdminDashboardPage {
  private readonly adminApiService = inject(AdminApiService);
  private readonly feedbackService = inject(FeedbackService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  dashboard: AdminDashboard | null = null;
  loading = false;

  ionViewWillEnter(): void {
    this.loadDashboard();
  }

  get metrics(): MetricTile[] {
    const metrics = this.dashboard?.metrics;
    if (!metrics) {
      return [];
    }

    return [
      { label: 'Usuarios activos', value: metrics.activeUsers, icon: 'people-outline', route: '/users' },
      { label: 'Usuarios totales', value: metrics.totalUsers, icon: 'person-circle-outline', route: '/users' },
      { label: 'Residentes activos', value: metrics.activeResidents, icon: 'id-card-outline', route: '/residents' },
      { label: 'Unidades activas', value: metrics.activeUnits, icon: 'business-outline', route: '/units' },
      { label: 'Visitas pendientes', value: metrics.pendingVisits, icon: 'walk-outline', route: '/visits' },
      { label: 'Encomiendas pendientes', value: metrics.pendingPackages, icon: 'cube-outline', route: '/packages' },
      { label: 'Notificaciones no leidas', value: metrics.unreadNotifications, icon: 'notifications-outline' },
      { label: 'Activos anexos', value: metrics.activeParkingSpots + metrics.activeStorages, icon: 'layers-outline' },
    ];
  }

  get recentActivity(): AdminRecentActivity[] {
    return this.dashboard?.recentActivity ?? [];
  }

  refresh(): void {
    this.loadDashboard();
  }

  openRoute(route?: string): void {
    if (!route) {
      return;
    }

    void this.router.navigate([route]);
  }

  actionColor(action: string): 'primary' | 'success' | 'warning' | 'medium' | 'tertiary' {
    switch (action) {
      case 'CREATE':
      case 'LOGIN':
        return 'success';
      case 'UPDATE':
      case 'STATUS_CHANGE':
        return 'primary';
      case 'DELIVERY':
      case 'VISIT_CHECKIN':
      case 'VISIT_CHECKOUT':
        return 'tertiary';
      default:
        return 'medium';
    }
  }

  private loadDashboard(): void {
    this.loading = true;
    this.adminApiService.getDashboard()
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: (dashboard) => {
          this.dashboard = dashboard;
        },
        error: async (error) => {
          await this.feedbackService.error(this.authService.getErrorMessage(error));
        },
      });
  }
}
