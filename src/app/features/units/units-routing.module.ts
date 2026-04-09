import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PERMISSIONS } from '../../core/auth/auth.models';
import { PermissionGuard } from '../../core/guards/permission.guard';
import { UnitDetailPage } from './pages/unit-detail/unit-detail.page';
import { UnitFormPage } from './pages/unit-form/unit-form.page';
import { UnitsListPage } from './pages/units-list/units-list.page';

const routes: Routes = [
  {
    path: '',
    canActivate: [PermissionGuard],
    data: { permissions: [PERMISSIONS.UNITS_READ] },
    component: UnitsListPage,
  },
  {
    path: 'new',
    canActivate: [PermissionGuard],
    data: { permissions: [PERMISSIONS.UNITS_MANAGE] },
    component: UnitFormPage,
  },
  {
    path: ':id/edit',
    canActivate: [PermissionGuard],
    data: { permissions: [PERMISSIONS.UNITS_MANAGE] },
    component: UnitFormPage,
  },
  {
    path: ':id',
    canActivate: [PermissionGuard],
    data: { permissions: [PERMISSIONS.UNITS_READ] },
    component: UnitDetailPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UnitsRoutingModule {}
