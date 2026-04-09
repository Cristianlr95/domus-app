import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { UnitDetailPage } from './pages/unit-detail/unit-detail.page';
import { UnitFormPage } from './pages/unit-form/unit-form.page';
import { UnitsListPage } from './pages/units-list/units-list.page';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: UnitsListPage,
  },
  {
    path: 'new',
    canActivate: [AuthGuard],
    component: UnitFormPage,
  },
  {
    path: ':id/edit',
    canActivate: [AuthGuard],
    component: UnitFormPage,
  },
  {
    path: ':id',
    canActivate: [AuthGuard],
    component: UnitDetailPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UnitsRoutingModule {}
