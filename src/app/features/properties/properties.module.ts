import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { PropertiesRoutingModule } from './properties-routing.module';
import { PropertiesListPage } from './pages/properties-list/properties-list.page';
import { PropertyDetailPage } from './pages/property-detail/property-detail.page';

@NgModule({
  declarations: [PropertiesListPage, PropertyDetailPage],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    PropertiesRoutingModule,
  ],
})
export class PropertiesModule {}
