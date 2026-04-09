import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { StoragesRoutingModule } from './storages-routing.module';
import { StoragesListPage } from './pages/storages-list/storages-list.page';
import { StorageFormPage } from './pages/storage-form/storage-form.page';
import { StorageDetailPage } from './pages/storage-detail/storage-detail.page';

@NgModule({
  declarations: [StoragesListPage, StorageFormPage, StorageDetailPage],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    StoragesRoutingModule,
  ],
})
export class StoragesModule {}
