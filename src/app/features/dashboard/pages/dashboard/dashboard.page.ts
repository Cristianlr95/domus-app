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
      route: '/residents',
    },
    {
      title: 'Conserjeria',
      description: 'Accede rapido a visitas, encomiendas y futuras tareas operativas.',
      roles: ['ADMIN', 'CONSERJERIA'],
      route: '/visits',
    },
    {
      title: 'Encomiendas',
      description: 'Registra recepciones, consulta pendientes y marca entregas desde un flujo rapido.',
      roles: ['ADMIN', 'CONSERJERIA'],
      route: '/packages',
    },
    {
      title: 'Portal residente',
      description: 'Prepara la base para solicitudes, avisos y aprobaciones futuras.',
      roles: ['ADMIN', 'RESIDENTE'],
    },
    {
      title: 'Residentes',
      description: 'Administra personas asociadas a unidades y su futura vinculacion con usuarios del sistema.',
      roles: ['ADMIN', 'CONSERJERIA'],
      route: '/residents',
    },
  ];

  get user(): AuthUser | null {
    return this.authService.currentUser();
  }

  logout(): void {
    this.authService.logout();
  }
}
