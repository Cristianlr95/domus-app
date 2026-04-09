import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PERMISSIONS } from '../../core/auth/auth.models';
import { PermissionGuard } from '../../core/guards/permission.guard';
import { ConciergeDashboardPage } from './pages/concierge-dashboard/concierge-dashboard.page';

const routes: Routes = [
  {
    path: '',
    component: ConciergeDashboardPage,
    canActivate: [PermissionGuard],
    data: {
      permissions: [PERMISSIONS.CONCIERGE_DASHBOARD_READ],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConciergeRoutingModule {}
