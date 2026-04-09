import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { UnitDetailPage } from './pages/unit-detail/unit-detail.page';
import { UnitFormPage } from './pages/unit-form/unit-form.page';
import { UnitsListPage } from './pages/units-list/units-list.page';
import { UnitsRoutingModule } from './units-routing.module';

@NgModule({
  declarations: [
    UnitsListPage,
    UnitFormPage,
    UnitDetailPage,
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    UnitsRoutingModule,
  ],
})
export class UnitsModule {}
