import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BookingsRoutingModule } from './bookings-routing.module';
import { BookingsListPage } from './pages/bookings-list/bookings-list.page';
import { BookingCreatePage } from './pages/booking-create/booking-create.page';
import { BookingDetailPage } from './pages/booking-detail/booking-detail.page';

@NgModule({
  declarations: [BookingsListPage, BookingCreatePage, BookingDetailPage],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    BookingsRoutingModule,
  ],
})
export class BookingsModule {}
