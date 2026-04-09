import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { VisitsRoutingModule } from './visits-routing.module';
import { VisitsListPage } from './pages/visits-list/visits-list.page';
import { VisitCreatePage } from './pages/visit-create/visit-create.page';
import { VisitDetailPage } from './pages/visit-detail/visit-detail.page';

@NgModule({
  declarations: [
    VisitsListPage,
    VisitCreatePage,
    VisitDetailPage,
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    VisitsRoutingModule,
  ],
})
export class VisitsModule {}
