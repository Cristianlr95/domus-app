import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ResidentDetailPage } from './pages/resident-detail/resident-detail.page';
import { ResidentFormPage } from './pages/resident-form/resident-form.page';
import { ResidentsListPage } from './pages/residents-list/residents-list.page';
import { ResidentsRoutingModule } from './residents-routing.module';

@NgModule({
  declarations: [
    ResidentsListPage,
    ResidentFormPage,
    ResidentDetailPage,
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    ResidentsRoutingModule,
  ],
})
export class ResidentsModule {}
