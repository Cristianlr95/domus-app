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
      description: 'Gestiona la base estructural del condominio con residentes y unidades.',
      roles: ['ADMIN', 'CONSERJERIA'],
      route: '/units',
    },
    {
      title: 'Conserjeria',
      description: 'Abre el panel operativo con resumen del dia, pendientes y actividad reciente.',
      roles: ['ADMIN', 'CONSERJERIA'],
      route: '/concierge',
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
    {
      title: 'Unidades',
      description: 'Consulta departamentos, asigna residentes y prepara la base para estacionamientos y bodegas.',
      roles: ['ADMIN', 'CONSERJERIA'],
      route: '/units',
    },
    {
      title: 'Estacionamientos',
      description: 'Administra espacios, ocupacion y futuras asociaciones con patentes y visitas.',
      roles: ['ADMIN', 'CONSERJERIA'],
      route: '/parking',
    },
    {
      title: 'Bodegas',
      description: 'Administra espacios de almacenamiento asociados a unidades y controla su disponibilidad.',
      roles: ['ADMIN', 'CONSERJERIA'],
      route: '/storages',
    },
  ];

  get user(): AuthUser | null {
    return this.authService.currentUser();
  }

  logout(): void {
    this.authService.logout();
  }
}
