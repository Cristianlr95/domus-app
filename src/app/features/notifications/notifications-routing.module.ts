import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PERMISSIONS } from '../../core/auth/auth.models';
import { PermissionGuard } from '../../core/guards/permission.guard';
import { NotificationsListPage } from './pages/notifications-list/notifications-list.page';

const routes: Routes = [
  {
    path: '',
    canActivate: [PermissionGuard],
    data: { permissions: [PERMISSIONS.NOTIFICATIONS_READ] },
    component: NotificationsListPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NotificationsRoutingModule {}
