import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { ParkingDetailPage } from './pages/parking-detail/parking-detail.page';
import { ParkingFormPage } from './pages/parking-form/parking-form.page';
import { ParkingListPage } from './pages/parking-list/parking-list.page';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: ParkingListPage,
  },
  {
    path: 'new',
    canActivate: [AuthGuard],
    component: ParkingFormPage,
  },
  {
    path: ':id/edit',
    canActivate: [AuthGuard],
    component: ParkingFormPage,
  },
  {
    path: ':id',
    canActivate: [AuthGuard],
    component: ParkingDetailPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ParkingRoutingModule {}
