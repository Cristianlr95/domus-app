import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PERMISSIONS } from '../../core/auth/auth.models';
import { PermissionGuard } from '../../core/guards/permission.guard';
import { PackageCreatePage } from './pages/package-create/package-create.page';
import { PackageDetailPage } from './pages/package-detail/package-detail.page';
import { PackagesListPage } from './pages/packages-list/packages-list.page';

const routes: Routes = [
  {
    path: '',
    canActivate: [PermissionGuard],
    data: { permissions: [PERMISSIONS.PACKAGES_READ] },
    component: PackagesListPage,
  },
  {
    path: 'new',
    canActivate: [PermissionGuard],
    data: { permissions: [PERMISSIONS.PACKAGES_CREATE] },
    component: PackageCreatePage,
  },
  {
    path: ':id',
    canActivate: [PermissionGuard],
    data: { permissions: [PERMISSIONS.PACKAGES_READ] },
    component: PackageDetailPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PackagesRoutingModule {}
