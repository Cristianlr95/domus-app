import { Component, inject } from '@angular/core';
import { AuthService } from '../../../../core/auth/auth.service';
import { AuthUser, UserRole } from '../../../../core/auth/auth.models';

interface QuickAction {
  title: string;
  description: string;
  roles: UserRole[];
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

  readonly quickActions: QuickAction[] = [
    {
      title: 'Administracion',
      description: 'Gestiona usuarios, comunidades y la configuracion base del sistema.',
      roles: ['ADMIN'],
    },
    {
      title: 'Conserjeria',
      description: 'Accede rapido a visitas, encomiendas y futuras tareas operativas.',
      roles: ['ADMIN', 'CONSERJERIA'],
      route: '/visits',
    },
    {
      title: 'Portal residente',
      description: 'Prepara la base para solicitudes, avisos y aprobaciones futuras.',
      roles: ['ADMIN', 'RESIDENTE'],
    },
  ];

  get user(): AuthUser | null {
    return this.authService.currentUser();
  }

  logout(): void {
    this.authService.logout();
  }
}
