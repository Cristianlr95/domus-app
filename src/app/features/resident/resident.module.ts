import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ResidentDashboardPage } from './pages/resident-dashboard/resident-dashboard.page';
import { ResidentRoutingModule } from './resident-routing.module';

@NgModule({
  declarations: [ResidentDashboardPage],
  imports: [CommonModule, IonicModule, ResidentRoutingModule],
})
export class ResidentModule {}
