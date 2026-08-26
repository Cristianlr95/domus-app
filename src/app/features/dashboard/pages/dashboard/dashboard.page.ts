import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthorizationService } from '../../../../core/auth/authorization.service';
import { AuthService } from '../../../../core/auth/auth.service';
import {
  AuthUser,
  PermissionCode,
  PERMISSIONS,
  UserRole,
} from '../../../../core/auth/auth.models';
import { NotificationsApiService } from '../../../notifications/services/notifications-api.service';

interface QuickAction {
  title: string;
  description: string;
  permissions: PermissionCode[];
  roles?: UserRole[];
  route?: string;
}

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false,
})
export class DashboardPage {
  readonly authService = inject(AuthService);
  readonly authorizationService = inject(AuthorizationService);
  readonly notificationsApiService = inject(NotificationsApiService);
  private readonly router = inject(Router);

  readonly quickActions: QuickAction[] = [
    {
      title: 'Panel administrativo',
      description: 'Revisa metricas globales, cuentas activas, pendientes y actividad auditada del sistema.',
      permissions: [PERMISSIONS.ADMIN_DASHBOARD_READ],
      route: '/admin',
    },
    {
      title: 'Administracion',
      description: 'Gestiona la base estructural del condominio con residentes y unidades.',
      permissions: [PERMISSIONS.UNITS_MANAGE],
      route: '/units',
    },
    {
      title: 'Conserjeria',
      description: 'Abre el panel operativo con resumen del dia, pendientes y actividad reciente.',
      permissions: [PERMISSIONS.CONCIERGE_DASHBOARD_READ],
      route: '/concierge',
    },
    {
      title: 'Encomiendas',
      description: 'Registra recepciones, consulta pendientes y marca entregas desde un flujo rapido.',
      permissions: [PERMISSIONS.PACKAGES_READ],
      route: '/packages',
    },
    {
      title: 'Servicios de la comunidad',
      description: 'Gestiona visitas QR, estacionamientos, lavandería, mantenimiento y solicitudes según tu perfil.',
      permissions: [
        PERMISSIONS.OPERATIONS_READ,
        PERMISSIONS.ACCESS_REQUEST,
        PERMISSIONS.PARKING_SESSIONS_REQUEST,
        PERMISSIONS.LAUNDRY_REQUEST,
        PERMISSIONS.RESIDENTS_MEMBERSHIP_REQUEST,
        PERMISSIONS.PACKAGES_PICKUP_REQUEST,
      ],
      route: '/operations',
    },
    {
      title: 'Portal residente',
      description: 'Consulta tus reservas, mensajes, avisos, visitas y encomiendas desde un solo lugar.',
      permissions: [PERMISSIONS.NOTIFICATIONS_READ],
      roles: ['RESIDENTE'],
      route: '/resident',
    },
    {
      title: 'Reservas',
      description: 'Gestiona espacios comunes, estados de reserva y solicitudes asociadas a unidades.',
      permissions: [PERMISSIONS.BOOKINGS_READ],
      route: '/bookings',
    },
    {
      title: 'Residentes',
      description: 'Administra personas asociadas a unidades y su futura vinculacion con usuarios del sistema.',
      permissions: [PERMISSIONS.RESIDENTS_READ],
      route: '/residents',
    },
    {
      title: 'Unidades',
      description: 'Consulta departamentos, asigna residentes y prepara la base para estacionamientos y bodegas.',
      permissions: [PERMISSIONS.UNITS_READ],
      route: '/units',
    },
    {
      title: 'Propiedades',
      description: 'Consulta comunidades, edificios y configuracion base para la administracion multi-propiedad.',
      permissions: [PERMISSIONS.PROPERTIES_READ],
      route: '/properties',
    },
    {
      title: 'Usuarios',
      description: 'Administra cuentas, roles y estado de acceso para equipos operativos y residentes.',
      permissions: [PERMISSIONS.USERS_READ],
      route: '/users',
    },
    {
      title: 'Estacionamientos',
      description: 'Administra espacios, ocupación, patentes y solicitudes de visitas.',
      permissions: [PERMISSIONS.PARKING_READ],
      route: '/parking',
    },
    {
      title: 'Bodegas',
      description: 'Administra espacios de almacenamiento asociados a unidades y controla su disponibilidad.',
      permissions: [PERMISSIONS.STORAGES_READ],
      route: '/storages',
    },
    {
      title: 'Mensajeria',
      description: 'Centraliza conversaciones internas entre residentes, conserjeria y administracion futura.',
      permissions: [PERMISSIONS.MESSAGING_READ],
      route: '/messaging',
    },
    {
      title: 'Auditoria',
      description: 'Revisa trazabilidad operativa y administrativa de acciones relevantes del sistema.',
      permissions: [PERMISSIONS.AUDIT_READ],
      route: '/audit',
    },
  ];

  get user(): AuthUser | null {
    return this.authService.currentUser();
  }

  canShowAction(action: QuickAction): boolean {
    return (
      this.authorizationService.hasAnyPermission(action.permissions) &&
      (!action.roles?.length ||
        this.authorizationService.hasAnyRole(action.roles))
    );
  }

  ionViewWillEnter(): void {
    if (this.authorizationService.hasRole('RESIDENTE')) {
      void this.router.navigate(['/resident'], { replaceUrl: true });
      return;
    }

    this.notificationsApiService.loadUnreadCount().subscribe();
  }

  logout(): void {
    this.authService.logout();
  }
}
