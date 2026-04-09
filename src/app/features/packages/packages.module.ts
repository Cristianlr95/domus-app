import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PackageCreatePage } from './pages/package-create/package-create.page';
import { PackageDetailPage } from './pages/package-detail/package-detail.page';
import { PackagesListPage } from './pages/packages-list/packages-list.page';
import { PackagesRoutingModule } from './packages-routing.module';

@NgModule({
  declarations: [
    PackagesListPage,
    PackageCreatePage,
    PackageDetailPage,
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    PackagesRoutingModule,
  ],
})
export class PackagesModule {}
