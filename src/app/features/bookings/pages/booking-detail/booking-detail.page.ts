import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BookingsApiService } from '../../services/bookings-api.service';
import { Booking, BookingStatus } from '../../models/booking.models';
import {
  ToastController,
  AlertController,
  LoadingController,
} from '@ionic/angular';

@Component({
  selector: 'app-booking-detail',
  templateUrl: './booking-detail.page.html',
  styleUrls: ['./booking-detail.page.scss'],
  standalone: false,
})
export class BookingDetailPage implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly bookingsApiService = inject(BookingsApiService);
  private readonly toastController = inject(ToastController);
  private readonly alertController = inject(AlertController);
  private readonly loadingController = inject(LoadingController);

  booking: Booking | null = null;
  isLoading = false;
  isUpdating = false;
  selectedStatus: BookingStatus | null = null;
  bookingStatuses: BookingStatus[] = [
    'DISPONIBLE',
    'RESERVADA',
    'CONFIRMADA',
    'CANCELADA',
    'COMPLETADA',
  ];
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.loadBooking();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadBooking(): void {
    this.isLoading = true;
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.router.navigate(['/bookings']);
      return;
    }

    this.bookingsApiService
      .getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.booking = data;
          this.selectedStatus = data.status;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading booking:', error);
          this.isLoading = false;
          this.showErrorToast('Error al cargar reserva');
          this.router.navigate(['/bookings']);
        },
      });
  }

  async updateStatus(): Promise<void> {
    if (!this.booking || !this.selectedStatus) {
      return;
    }

    const alert = await this.alertController.create({
      header: 'Cambiar estado',
      message: `¿Deseas cambiar el estado a ${this.getStatusLabel(this.selectedStatus)}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Confirmar',
          handler: () => {
            this.performStatusUpdate();
          },
        },
      ],
    });
    await alert.present();
  }

  private async performStatusUpdate(): Promise<void> {
    if (!this.booking || !this.selectedStatus) {
      return;
    }

    this.isUpdating = true;
    const loading = await this.loadingController.create({
      message: 'Actualizando estado...',
    });
    await loading.present();

    this.bookingsApiService
      .updateStatus(this.booking.id, { status: this.selectedStatus })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          loading.dismiss();
          this.isUpdating = false;
          this.booking = updated;
          this.showSuccessToast('Estado actualizado');
        },
        error: (error) => {
          loading.dismiss();
          this.isUpdating = false;
          console.error('Error updating status:', error);
          this.showErrorToast('Error al actualizar estado');
        },
      });
  }

  async cancelBooking(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Cancelar reserva',
      message: '¿Estás seguro de que deseas cancelar esta reserva?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
        },
        {
          text: 'Sí, cancelar',
          handler: () => {
            this.performCancel();
          },
        },
      ],
    });
    await alert.present();
  }

  private async performCancel(): Promise<void> {
    if (!this.booking) {
      return;
    }

    this.isUpdating = true;
    const loading = await this.loadingController.create({
      message: 'Cancelando reserva...',
    });
    await loading.present();

    this.bookingsApiService
      .cancel(this.booking.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          loading.dismiss();
          this.isUpdating = false;
          this.booking = updated;
          this.selectedStatus = updated.status;
          this.showSuccessToast('Reserva cancelada');
        },
        error: (error) => {
          loading.dismiss();
          this.isUpdating = false;
          console.error('Error canceling booking:', error);
          this.showErrorToast('Error al cancelar reserva');
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/bookings']);
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
}
