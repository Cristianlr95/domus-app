import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { FeedbackService } from '../../../../core/services/feedback.service';
import { ParkingOccupancyStatus, ParkingSpot, ParkingType } from '../../models/parking.models';
import { ParkingApiService } from '../../services/parking-api.service';

@Component({
  selector: 'app-parking-list-page',
  templateUrl: './parking-list.page.html',
  styleUrls: ['./parking-list.page.scss'],
  standalone: false,
})
export class ParkingListPage {
  private readonly parkingApiService = inject(ParkingApiService);
  private readonly feedbackService = inject(FeedbackService);
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  parkingSpots: ParkingSpot[] = [];
  loading = false;
  selectedActive: boolean | '' = '';
  selectedOccupancyStatus: ParkingOccupancyStatus | '' = '';
  selectedParkingType: ParkingType | '' = '';
  search = '';

  readonly occupancyOptions: { value: ParkingOccupancyStatus; label: string }[] = [
    { value: 'DISPONIBLE', label: 'Disponible' },
    { value: 'OCUPADO', label: 'Ocupado' },
  ];

  readonly typeOptions: { value: ParkingType; label: string }[] = [
    { value: 'RESIDENTE', label: 'Residente' },
    { value: 'VISITA', label: 'Visita' },
    { value: 'COMUN', label: 'Comun' },
  ];

  ionViewWillEnter(): void {
    this.loadParkingSpots();
  }

  loadParkingSpots(): void {
    this.loading = true;
    this.parkingApiService.list(this.selectedActive, this.selectedOccupancyStatus, this.selectedParkingType, this.search)
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: (parkingSpots) => {
          this.parkingSpots = parkingSpots;
        },
        error: async (error) => {
          await this.feedbackService.error(this.authService.getErrorMessage(error));
        },
      });
  }

  onFilterChange(): void {
    this.loadParkingSpots();
  }

  createParking(): void {
    void this.router.navigate(['/parking/new']);
  }

  openDetail(parkingId: string): void {
    void this.router.navigate(['/parking', parkingId]);
  }

  trackByParking(_index: number, parking: ParkingSpot): string {
    return parking.id;
  }

  occupancyColor(status: ParkingOccupancyStatus): 'success' | 'warning' {
    return status === 'DISPONIBLE' ? 'success' : 'warning';
  }

  typeLabel(type: ParkingType): string {
    switch (type) {
      case 'RESIDENTE':
        return 'Residente';
      case 'VISITA':
        return 'Visita';
      case 'COMUN':
        return 'Comun';
    }
  }
}
