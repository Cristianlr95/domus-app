import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PERMISSIONS } from '../../core/auth/auth.models';
import { PermissionGuard } from '../../core/guards/permission.guard';
import { ResidentDetailPage } from './pages/resident-detail/resident-detail.page';
import { ResidentFormPage } from './pages/resident-form/resident-form.page';
import { ResidentsListPage } from './pages/residents-list/residents-list.page';

const routes: Routes = [
  {
    path: '',
    canActivate: [PermissionGuard],
    data: { permissions: [PERMISSIONS.RESIDENTS_READ] },
    component: ResidentsListPage,
  },
  {
    path: 'new',
    canActivate: [PermissionGuard],
    data: { permissions: [PERMISSIONS.RESIDENTS_MANAGE] },
    component: ResidentFormPage,
  },
  {
    path: ':id/edit',
    canActivate: [PermissionGuard],
    data: { permissions: [PERMISSIONS.RESIDENTS_MANAGE] },
    component: ResidentFormPage,
  },
  {
    path: ':id',
    canActivate: [PermissionGuard],
    data: { permissions: [PERMISSIONS.RESIDENTS_READ] },
    component: ResidentDetailPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ResidentsRoutingModule {}
