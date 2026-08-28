import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PERMISSIONS } from '../../core/auth/auth.models';
import { PermissionGuard } from '../../core/guards/permission.guard';
import { ParkingDetailPage } from './pages/parking-detail/parking-detail.page';
import { ParkingFormPage } from './pages/parking-form/parking-form.page';
import { ParkingListPage } from './pages/parking-list/parking-list.page';

const routes: Routes = [
  {
    path: '',
    canActivate: [PermissionGuard],
    data: {
      permissions: [
        PERMISSIONS.PARKING_READ,
        PERMISSIONS.PARKING_SESSIONS_MANAGE,
        PERMISSIONS.PARKING_SESSIONS_REQUEST,
      ],
    },
    component: ParkingListPage,
  },
  {
    path: 'new',
    canActivate: [PermissionGuard],
    data: { permissions: [PERMISSIONS.PARKING_SPACES_MANAGE] },
    component: ParkingFormPage,
  },
  {
    path: ':id/edit',
    canActivate: [PermissionGuard],
    data: { permissions: [PERMISSIONS.PARKING_SPACES_MANAGE] },
    component: ParkingFormPage,
  },
  {
    path: ':id',
    canActivate: [PermissionGuard],
    data: { permissions: [PERMISSIONS.PARKING_READ] },
    component: ParkingDetailPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ParkingRoutingModule {}
