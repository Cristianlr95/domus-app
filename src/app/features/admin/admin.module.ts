import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminDashboardPage } from './pages/admin-dashboard/admin-dashboard.page';

@NgModule({
  declarations: [AdminDashboardPage],
  imports: [CommonModule, IonicModule, AdminRoutingModule],
})
export class AdminModule {}
