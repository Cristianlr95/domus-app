import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PERMISSIONS } from '../../core/auth/auth.models';
import { PermissionGuard } from '../../core/guards/permission.guard';
import { StorageDetailPage } from './pages/storage-detail/storage-detail.page';
import { StorageFormPage } from './pages/storage-form/storage-form.page';
import { StoragesListPage } from './pages/storages-list/storages-list.page';

const routes: Routes = [
  {
    path: '',
    canActivate: [PermissionGuard],
    data: { permissions: [PERMISSIONS.STORAGES_READ] },
    component: StoragesListPage,
  },
  {
    path: 'new',
    canActivate: [PermissionGuard],
    data: { permissions: [PERMISSIONS.STORAGES_MANAGE] },
    component: StorageFormPage,
  },
  {
    path: ':id/edit',
    canActivate: [PermissionGuard],
    data: { permissions: [PERMISSIONS.STORAGES_MANAGE] },
    component: StorageFormPage,
  },
  {
    path: ':id',
    canActivate: [PermissionGuard],
    data: { permissions: [PERMISSIONS.STORAGES_READ] },
    component: StorageDetailPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StoragesRoutingModule {}
