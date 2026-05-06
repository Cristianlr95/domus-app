import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BookingsApiService } from '../../services/bookings-api.service';
import { CommonSpace, CreateBookingRequest } from '../../models/booking.models';
import { ToastController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-booking-create',
  templateUrl: './booking-create.page.html',
  styleUrls: ['./booking-create.page.scss'],
  standalone: false,
})
export class BookingCreatePage implements OnInit, OnDestroy {
  bookingForm!: FormGroup;
  spaces: CommonSpace[] = [];
  isLoading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private bookingsApiService: BookingsApiService,
    private router: Router,
    private toastController: ToastController,
    private loadingController: LoadingController,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadSpaces();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    const today = new Date().toISOString().split('T')[0];
    this.bookingForm = this.formBuilder.group({
      commonSpaceId: ['', Validators.required],
      bookingDate: [today, Validators.required],
      startTime: ['10:00', Validators.required],
      endTime: ['12:00', Validators.required],
      guestCount: [null],
      observations: [''],
    });
  }

  private loadSpaces(): void {
    this.bookingsApiService
      .listSpaces()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.spaces = data;
        },
        error: (error) => {
          console.error('Error loading spaces:', error);
          this.showErrorToast('Error al cargar espacios');
        },
      });
  }

  async onSubmit(): Promise<void> {
    if (this.bookingForm.invalid) {
      this.showErrorToast('Por favor completa los campos requeridos');
      return;
    }

    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Creando reserva...',
    });
    await loading.present();

    const payload: CreateBookingRequest = this.bookingForm.value;

    this.bookingsApiService
      .create(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (booking) => {
          loading.dismiss();
          this.isLoading = false;
          this.showSuccessToast('Reserva creada exitosamente');
          this.router.navigate(['/bookings', booking.id]);
        },
        error: (error) => {
          loading.dismiss();
          this.isLoading = false;
          console.error('Error creating booking:', error);
          this.showErrorToast('Error al crear reserva');
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/bookings']);
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
