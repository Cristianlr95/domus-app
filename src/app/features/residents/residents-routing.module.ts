import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { ResidentDetailPage } from './pages/resident-detail/resident-detail.page';
import { ResidentFormPage } from './pages/resident-form/resident-form.page';
import { ResidentsListPage } from './pages/residents-list/residents-list.page';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: ResidentsListPage,
  },
  {
    path: 'new',
    canActivate: [AuthGuard],
    component: ResidentFormPage,
  },
  {
    path: ':id/edit',
    canActivate: [AuthGuard],
    component: ResidentFormPage,
  },
  {
    path: ':id',
    canActivate: [AuthGuard],
    component: ResidentDetailPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ResidentsRoutingModule {}
