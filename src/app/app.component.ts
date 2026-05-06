import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PermissionCode, PERMISSIONS } from './core/auth/auth.models';
import { AuthService } from './core/auth/auth.service';
import { AuthorizationService } from './core/auth/authorization.service';
import { NotificationsApiService } from './features/notifications/services/notifications-api.service';

interface ShellNavItem {
  label: string;
  route: string;
  icon: string;
  permissions?: PermissionCode[];
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

  protected readonly navItems: ShellNavItem[] = [
    {
      label: 'Inicio',
      route: '/dashboard',
      icon: 'grid-outline',
      mobile: true,
    },
    {
      label: 'Conserjeria',
      route: '/concierge',
      icon: 'shield-checkmark-outline',
      permissions: [PERMISSIONS.CONCIERGE_DASHBOARD_READ],
      mobile: true,
    },
    {
      label: 'Visitas',
      route: '/visits',
      icon: 'walk-outline',
      permissions: [PERMISSIONS.VISITS_READ],
      mobile: true,
    },
    {
      label: 'Encomiendas',
      route: '/packages',
      icon: 'cube-outline',
      permissions: [PERMISSIONS.PACKAGES_READ],
      mobile: true,
    },
    {
      label: 'Reservas',
      route: '/bookings',
      icon: 'calendar-outline',
      permissions: [PERMISSIONS.BOOKINGS_READ],
    },
    {
      label: 'Residentes',
      route: '/residents',
      icon: 'people-outline',
      permissions: [PERMISSIONS.RESIDENTS_READ],
    },
    {
      label: 'Unidades',
      route: '/units',
      icon: 'business-outline',
      permissions: [PERMISSIONS.UNITS_READ],
    },
    {
      label: 'Propiedades',
      route: '/properties',
      icon: 'home-outline',
      permissions: [PERMISSIONS.PROPERTIES_READ],
    },
    {
      label: 'Usuarios',
      route: '/users',
      icon: 'person-circle-outline',
      permissions: [PERMISSIONS.USERS_READ],
    },
    {
      label: 'Mensajeria',
      route: '/messaging',
      icon: 'chatbubbles-outline',
      permissions: [PERMISSIONS.MESSAGING_READ],
    },
    {
      label: 'Notificaciones',
      route: '/notifications',
      icon: 'notifications-outline',
      permissions: [PERMISSIONS.NOTIFICATIONS_READ],
      mobile: true,
    },
    {
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
    return this.visibleNavItems.filter((item) => item.mobile);
  }

  protected canShow(item: ShellNavItem): boolean {
    if (!item.permissions?.length) {
      return true;
    }

    return this.authorizationService.hasAnyPermission(item.permissions);
  }

  protected logout(): void {
    this.authService.logout();
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
