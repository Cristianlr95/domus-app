import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PERMISSIONS } from '../../core/auth/auth.models';
import { PermissionGuard } from '../../core/guards/permission.guard';
import { VisitCreatePage } from './pages/visit-create/visit-create.page';
import { VisitDetailPage } from './pages/visit-detail/visit-detail.page';
import { VisitsListPage } from './pages/visits-list/visits-list.page';

const routes: Routes = [
  {
    path: '',
    canActivate: [PermissionGuard],
    data: { permissions: [PERMISSIONS.VISITS_READ] },
    component: VisitsListPage,
  },
  {
    path: 'new',
    canActivate: [PermissionGuard],
    data: { permissions: [PERMISSIONS.VISITS_CREATE] },
    component: VisitCreatePage,
  },
  {
    path: ':id',
    canActivate: [PermissionGuard],
    data: { permissions: [PERMISSIONS.VISITS_READ] },
    component: VisitDetailPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VisitsRoutingModule {}
