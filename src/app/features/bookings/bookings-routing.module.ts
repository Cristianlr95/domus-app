import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PERMISSIONS } from '../../core/auth/auth.models';
import { PermissionGuard } from '../../core/guards/permission.guard';
import { BookingCreatePage } from './pages/booking-create/booking-create.page';
import { BookingDetailPage } from './pages/booking-detail/booking-detail.page';
import { BookingsListPage } from './pages/bookings-list/bookings-list.page';

const routes: Routes = [
  {
    path: '',
    canActivate: [PermissionGuard],
    data: { permissions: [PERMISSIONS.BOOKINGS_READ] },
    component: BookingsListPage,
  },
  {
    path: 'new',
    canActivate: [PermissionGuard],
    data: { permissions: [PERMISSIONS.BOOKINGS_CREATE] },
    component: BookingCreatePage,
  },
  {
    path: ':id',
    canActivate: [PermissionGuard],
    data: { permissions: [PERMISSIONS.BOOKINGS_READ] },
    component: BookingDetailPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BookingsRoutingModule {}
