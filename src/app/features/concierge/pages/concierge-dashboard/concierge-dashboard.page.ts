import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthorizationService } from '../../../../core/auth/authorization.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { PermissionCode, PERMISSIONS } from '../../../../core/auth/auth.models';
import { FeedbackService } from '../../../../core/services/feedback.service';
import { NotificationsApiService } from '../../../notifications/services/notifications-api.service';
import { ConciergeDashboard, ConciergeRecentActivity } from '../../models/concierge-dashboard.models';
import { ConciergeApiService } from '../../services/concierge-api.service';

interface ConciergeQuickLink {
  title: string;
  description: string;
  route: string;
  permission: PermissionCode;
}

@Component({
  selector: 'app-concierge-dashboard-page',
  templateUrl: './concierge-dashboard.page.html',
  styleUrls: ['./concierge-dashboard.page.scss'],
  standalone: false,
})
export class ConciergeDashboardPage {
  private readonly conciergeApiService = inject(ConciergeApiService);
  private readonly feedbackService = inject(FeedbackService);
  private readonly authService = inject(AuthService);
  readonly authorizationService = inject(AuthorizationService);
  private readonly router = inject(Router);
  readonly notificationsApiService = inject(NotificationsApiService);

  readonly quickLinks: ConciergeQuickLink[] = [
    {
      title: 'Visitas',
      description: 'Registrar ingresos y revisar visitas pendientes o activas.',
      route: '/visits',
      permission: PERMISSIONS.VISITS_READ,
    },
    {
      title: 'Encomiendas',
      description: 'Registrar recepciones y marcar entregas del día.',
      route: '/packages',
      permission: PERMISSIONS.PACKAGES_READ,
    },
    {
      title: 'Visitas QR y servicios',
      description: 'Validar accesos QR, gestionar estacionamientos y revisar lavandería.',
      route: '/operations',
      permission: PERMISSIONS.OPERATIONS_READ,
    },
    {
      title: 'Residentes',
      description: 'Buscar personas asociadas a las unidades del edificio.',
      route: '/residents',
      permission: PERMISSIONS.RESIDENTS_READ,
    },
    {
      title: 'Unidades',
      description: 'Consultar departamentos y validar sus residentes asociados.',
      route: '/units',
      permission: PERMISSIONS.UNITS_READ,
    },
    {
      title: 'Estacionamientos',
      description: 'Visualizar espacios disponibles u ocupados y administrar sus asociaciones.',
      route: '/parking',
      permission: PERMISSIONS.PARKING_READ,
    },
    {
      title: 'Bodegas',
      description: 'Consultar espacios de almacenamiento por unidad y controlar su disponibilidad.',
      route: '/storages',
      permission: PERMISSIONS.STORAGES_READ,
    },
    {
      title: 'Mensajeria',
      description: 'Enviar avisos rapidos a residentes y revisar conversaciones activas.',
      route: '/messaging',
      permission: PERMISSIONS.MESSAGING_READ,
    },
  ];

  get visibleQuickLinks(): ConciergeQuickLink[] {
    return this.quickLinks.filter((item) => this.authorizationService.hasPermission(item.permission));
  }

  dashboard: ConciergeDashboard | null = null;
  loading = false;

  ionViewWillEnter(): void {
    this.notificationsApiService.loadUnreadCount().subscribe();
    this.loadDashboard();
  }

  get recentActivity(): ConciergeRecentActivity[] {
    return this.dashboard?.recentActivity ?? [];
  }

  openRoute(route: string): void {
    void this.router.navigate([route]);
  }

  refresh(): void {
    this.loadDashboard();
  }

  activityStatusColor(status: string): 'primary' | 'success' | 'warning' | 'medium' | 'tertiary' {
    switch (status) {
      case 'INGRESADA':
      case 'ACTIVO':
      case 'ACTIVA':
        return 'success';
      case 'PENDIENTE':
      case 'RECIBIDA':
        return 'warning';
      case 'NOTIFICADA':
        return 'primary';
      case 'FINALIZADA':
      case 'ENTREGADA':
        return 'tertiary';
      default:
        return 'medium';
    }
  }

  private loadDashboard(): void {
    this.loading = true;
    this.conciergeApiService.getDashboard()
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
