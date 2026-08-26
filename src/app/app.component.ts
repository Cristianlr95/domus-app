import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import {
  PermissionCode,
  PERMISSIONS,
  UserRole,
} from './core/auth/auth.models';
import { AuthService } from './core/auth/auth.service';
import { AuthorizationService } from './core/auth/authorization.service';
import { NotificationsApiService } from './features/notifications/services/notifications-api.service';

interface ShellNavItem {
  group: 'principal' | 'operacion' | 'gestion';
  label: string;
  mobileLabel?: string;
  route: string;
  icon: string;
  permissions?: PermissionCode[];
  roles?: UserRole[];
  excludeRoles?: UserRole[];
  mobile?: boolean;
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  protected readonly authService = inject(AuthService);
  protected readonly authorizationService = inject(AuthorizationService);
  protected readonly notificationsApiService = inject(NotificationsApiService);
  private readonly router = inject(Router);
  private readonly menuController = inject(MenuController);

  protected readonly navGroups = [
    { key: 'principal' as const, label: 'Principal' },
    { key: 'operacion' as const, label: 'Operación diaria' },
    { key: 'gestion' as const, label: 'Administración' },
  ];

  protected readonly navItems: ShellNavItem[] = [
    {
      group: 'principal',
      label: 'Inicio',
      route: '/dashboard',
      icon: 'grid-outline',
      excludeRoles: ['RESIDENTE'],
      mobile: true,
    },
    {
      group: 'principal',
      label: 'Mi portal',
      route: '/resident',
      icon: 'home-outline',
      roles: ['RESIDENTE'],
      mobile: true,
    },
    {
      group: 'principal',
      label: 'Conserjeria',
      mobileLabel: 'Conserj.',
      route: '/concierge',
      icon: 'shield-checkmark-outline',
      permissions: [PERMISSIONS.CONCIERGE_DASHBOARD_READ],
      mobile: true,
    },
    {
      group: 'principal',
      label: 'Admin',
      route: '/admin',
      icon: 'analytics-outline',
      permissions: [PERMISSIONS.ADMIN_DASHBOARD_READ],
      mobile: true,
    },
    {
      group: 'operacion',
      label: 'Visitas',
      route: '/visits',
      icon: 'walk-outline',
      permissions: [PERMISSIONS.VISITS_READ],
      mobile: true,
    },
    {
      group: 'operacion',
      label: 'Encomiendas',
      mobileLabel: 'Encom.',
      route: '/packages',
      icon: 'cube-outline',
      permissions: [PERMISSIONS.PACKAGES_READ],
      mobile: true,
    },
    {
      group: 'operacion',
      label: 'Reservas',
      route: '/bookings',
      icon: 'calendar-outline',
      permissions: [PERMISSIONS.BOOKINGS_READ],
      mobile: true,
    },
    {
      group: 'gestion',
      label: 'Residentes',
      route: '/residents',
      icon: 'people-outline',
      permissions: [PERMISSIONS.RESIDENTS_READ],
    },
    {
      group: 'gestion',
      label: 'Unidades',
      route: '/units',
      icon: 'business-outline',
      permissions: [PERMISSIONS.UNITS_READ],
    },
    {
      group: 'gestion',
      label: 'Estacionamientos',
      mobileLabel: 'Parking',
      route: '/parking',
      icon: 'car-outline',
      permissions: [PERMISSIONS.PARKING_READ],
      mobile: true,
    },
    {
      group: 'gestion',
      label: 'Bodegas',
      route: '/storages',
      icon: 'file-tray-stacked-outline',
      permissions: [PERMISSIONS.STORAGES_READ],
    },
    {
      group: 'gestion',
      label: 'Propiedades',
      route: '/properties',
      icon: 'home-outline',
      permissions: [PERMISSIONS.PROPERTIES_READ],
    },
    {
      group: 'gestion',
      label: 'Usuarios',
      route: '/users',
      icon: 'person-circle-outline',
      permissions: [PERMISSIONS.USERS_READ],
    },
    {
      group: 'gestion',
      label: 'Configuración',
      route: '/setup',
      icon: 'construct-outline',
      permissions: [PERMISSIONS.SETUP_MANAGE],
    },
    {
      group: 'operacion',
      label: 'Mensajeria',
      route: '/messaging',
      icon: 'chatbubbles-outline',
      permissions: [PERMISSIONS.MESSAGING_READ],
      mobile: true,
    },
    {
      group: 'principal',
      label: 'Notificaciones',
      mobileLabel: 'Avisos',
      route: '/notifications',
      icon: 'notifications-outline',
      permissions: [PERMISSIONS.NOTIFICATIONS_READ],
      mobile: true,
    },
    {
      group: 'operacion',
      label: 'Centro operativo',
      mobileLabel: 'Servicios',
      route: '/operations',
      icon: 'apps-outline',
      permissions: [
        PERMISSIONS.OPERATIONS_READ,
        PERMISSIONS.ACCESS_REQUEST,
        PERMISSIONS.PARKING_SESSIONS_REQUEST,
        PERMISSIONS.LAUNDRY_REQUEST,
        PERMISSIONS.RESIDENTS_MEMBERSHIP_REQUEST,
        PERMISSIONS.PACKAGES_PICKUP_REQUEST,
      ],
      mobile: true,
    },
    {
      group: 'gestion',
      label: 'Auditoria',
      route: '/audit',
      icon: 'receipt-outline',
      permissions: [PERMISSIONS.AUDIT_READ],
    },
  ];

  ngOnInit(): void {
    this.authService.restoreSession().subscribe({
      next: (user) => {
        if (user) {
          if (user.permissions.includes(PERMISSIONS.NOTIFICATIONS_READ)) {
            this.notificationsApiService.loadUnreadCount().subscribe();
            return;
          }

          this.notificationsApiService.clearUnreadCount();
          return;
        }

        this.notificationsApiService.clearUnreadCount();
      },
    });
  }

  protected get visibleNavItems(): ShellNavItem[] {
    return this.navItems.filter((item) => this.canShow(item));
  }

  protected get visibleMobileNavItems(): ShellNavItem[] {
    return this.visibleNavItems.filter((item) => item.mobile).slice(0, 4);
  }

  protected get hasMoreNavigation(): boolean {
    return this.visibleNavItems.some(
      (item) => !this.visibleMobileNavItems.includes(item),
    );
  }

  protected visibleItemsForGroup(group: ShellNavItem['group']): ShellNavItem[] {
    return this.visibleNavItems.filter((item) => item.group === group);
  }

  protected roleLabel(roles: UserRole[]): string {
    const labels: Record<UserRole, string> = {
      ADMIN: 'Administración',
      CONSERJERIA: 'Conserjería',
      RESIDENTE: 'Residente',
    };
    return roles.map((role) => labels[role]).join(' · ');
  }

  protected canShow(item: ShellNavItem): boolean {
    if (item.roles?.length && !this.authorizationService.hasAnyRole(item.roles)) {
      return false;
    }

    if (
      item.excludeRoles?.length &&
      this.authorizationService.hasAnyRole(item.excludeRoles)
    ) {
      return false;
    }

    if (!item.permissions?.length) {
      return true;
    }

    return this.authorizationService.hasAnyPermission(item.permissions);
  }

  protected logout(): void {
    this.authService.logout();
  }

  protected openMenu(): void {
    void this.menuController.open();
  }

  protected isActive(route: string): boolean {
    return this.router.isActive(route, {
      paths: 'subset',
      queryParams: 'ignored',
      fragment: 'ignored',
      matrixParams: 'ignored',
    });
  }
}
