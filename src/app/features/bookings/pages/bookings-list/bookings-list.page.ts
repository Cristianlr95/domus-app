import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BookingsApiService } from '../../services/bookings-api.service';
import {
  Booking,
  BookingFilter,
  BookingStatus,
} from '../../models/booking.models';
import { ToastController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-bookings-list',
  templateUrl: './bookings-list.page.html',
  styleUrls: ['./bookings-list.page.scss'],
  standalone: false,
})
export class BookingsListPage implements OnInit, OnDestroy {
  private readonly bookingsApiService = inject(BookingsApiService);
  private readonly router = inject(Router);
  private readonly toastController = inject(ToastController);
  private readonly alertController = inject(AlertController);

  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  isLoading = false;
  selectedStatus: BookingStatus | '' = '';
  searchTerm = '';
  private destroy$ = new Subject<void>();

  bookingStatuses: BookingStatus[] = [
    'DISPONIBLE',
    'RESERVADA',
    'CONFIRMADA',
    'CANCELADA',
    'COMPLETADA',
  ];

  ngOnInit(): void {
    this.loadBookings();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBookings(): void {
    this.isLoading = true;
    const filter: BookingFilter = {
      status: this.selectedStatus,
      search: this.searchTerm,
    };

    this.bookingsApiService
      .list(filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.bookings = data;
          this.filteredBookings = data;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading bookings:', error);
          this.isLoading = false;
          this.showErrorToast('Error al cargar reservas');
        },
      });
  }

  onStatusChange(): void {
    this.loadBookings();
  }

  onSearch(event: any): void {
    this.searchTerm = event.target.value;
    this.loadBookings();
  }

  viewDetails(bookingId: string): void {
    this.router.navigate(['/bookings', bookingId]);
  }

  createBooking(): void {
    this.router.navigate(['/bookings/new']);
  }

  async cancelBooking(booking: Booking): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Cancelar reserva',
      message: `¿Estás seguro de que deseas cancelar la reserva de ${booking.commonSpaceName}?`,
      buttons: [
        {
          text: 'No',
          role: 'cancel',
        },
        {
          text: 'Sí, cancelar',
          handler: () => {
            this.bookingsApiService
              .cancel(booking.id)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: () => {
                  this.showSuccessToast('Reserva cancelada');
                  this.loadBookings();
                },
                error: (error) => {
                  console.error('Error canceling booking:', error);
                  this.showErrorToast('Error al cancelar reserva');
                },
              });
          },
        },
      ],
    });
    await alert.present();
  }

  private async showErrorToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
      color: 'danger',
    });
    await toast.present();
  }

  private async showSuccessToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color: 'success',
    });
    await toast.present();
  }

  getStatusColor(status: BookingStatus): string {
    switch (status) {
      case 'DISPONIBLE':
        return 'success';
      case 'RESERVADA':
        return 'warning';
      case 'CONFIRMADA':
        return 'primary';
      case 'COMPLETADA':
        return 'secondary';
      case 'CANCELADA':
        return 'danger';
      default:
        return 'medium';
    }
  }

  getStatusLabel(status: BookingStatus): string {
    const labels: Record<BookingStatus, string> = {
      DISPONIBLE: 'Disponible',
      RESERVADA: 'Reservada',
      CONFIRMADA: 'Confirmada',
      CANCELADA: 'Cancelada',
      COMPLETADA: 'Completada',
    };
    return labels[status] || status;
  }
}
