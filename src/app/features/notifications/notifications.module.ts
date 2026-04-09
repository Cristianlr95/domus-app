import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { NotificationsRoutingModule } from './notifications-routing.module';
import { NotificationsListPage } from './pages/notifications-list/notifications-list.page';

@NgModule({
  declarations: [NotificationsListPage],
  imports: [
    CommonModule,
    IonicModule,
    NotificationsRoutingModule,
  ],
})
export class NotificationsModule {}
