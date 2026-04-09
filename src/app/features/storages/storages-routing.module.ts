import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { StorageDetailPage } from './pages/storage-detail/storage-detail.page';
import { StorageFormPage } from './pages/storage-form/storage-form.page';
import { StoragesListPage } from './pages/storages-list/storages-list.page';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: StoragesListPage,
  },
  {
    path: 'new',
    canActivate: [AuthGuard],
    component: StorageFormPage,
  },
  {
    path: ':id/edit',
    canActivate: [AuthGuard],
    component: StorageFormPage,
  },
  {
    path: ':id',
    canActivate: [AuthGuard],
    component: StorageDetailPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StoragesRoutingModule {}
