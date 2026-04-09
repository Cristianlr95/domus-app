import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { NotificationsListPage } from './pages/notifications-list/notifications-list.page';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: NotificationsListPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NotificationsRoutingModule {}
