import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '../../core/guards/role.guard';
import { ConciergeDashboardPage } from './pages/concierge-dashboard/concierge-dashboard.page';

const routes: Routes = [
  {
    path: '',
    component: ConciergeDashboardPage,
    canActivate: [RoleGuard],
    data: {
      roles: ['ADMIN', 'CONSERJERIA'],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConciergeRoutingModule {}
