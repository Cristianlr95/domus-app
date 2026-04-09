import { Component, inject } from '@angular/core';
import { AuthService } from '../../../../core/auth/auth.service';
import { AuthUser, UserRole } from '../../../../core/auth/auth.models';

interface QuickAction {
  title: string;
  description: string;
  roles: UserRole[];
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
      title: 'Administración',
      description: 'Gestiona usuarios, comunidades y la configuración base del sistema.',
      roles: ['ADMIN'],
    },
    {
      title: 'Conserjería',
      description: 'Accede rápido a visitas, encomiendas y futuras tareas operativas.',
      roles: ['ADMIN', 'CONSERJERIA'],
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
