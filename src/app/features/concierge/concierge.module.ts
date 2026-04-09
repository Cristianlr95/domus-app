import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ConciergeRoutingModule } from './concierge-routing.module';
import { ConciergeDashboardPage } from './pages/concierge-dashboard/concierge-dashboard.page';

@NgModule({
  declarations: [ConciergeDashboardPage],
  imports: [
    CommonModule,
    IonicModule,
    ConciergeRoutingModule,
  ],
})
export class ConciergeModule {}
