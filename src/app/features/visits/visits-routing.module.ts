import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { VisitCreatePage } from './pages/visit-create/visit-create.page';
import { VisitDetailPage } from './pages/visit-detail/visit-detail.page';
import { VisitsListPage } from './pages/visits-list/visits-list.page';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: VisitsListPage,
  },
  {
    path: 'new',
    canActivate: [AuthGuard],
    component: VisitCreatePage,
  },
  {
    path: ':id',
    canActivate: [AuthGuard],
    component: VisitDetailPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VisitsRoutingModule {}
