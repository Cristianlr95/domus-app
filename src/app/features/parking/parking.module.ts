import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ParkingRoutingModule } from './parking-routing.module';
import { ParkingListPage } from './pages/parking-list/parking-list.page';
import { ParkingFormPage } from './pages/parking-form/parking-form.page';
import { ParkingDetailPage } from './pages/parking-detail/parking-detail.page';

@NgModule({
  declarations: [ParkingListPage, ParkingFormPage, ParkingDetailPage],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ParkingRoutingModule,
  ],
})
export class ParkingModule {}
