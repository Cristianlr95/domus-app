import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { PackageCreatePage } from './pages/package-create/package-create.page';
import { PackageDetailPage } from './pages/package-detail/package-detail.page';
import { PackagesListPage } from './pages/packages-list/packages-list.page';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: PackagesListPage,
  },
  {
    path: 'new',
    canActivate: [AuthGuard],
    component: PackageCreatePage,
  },
  {
    path: ':id',
    canActivate: [AuthGuard],
    component: PackageDetailPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PackagesRoutingModule {}
