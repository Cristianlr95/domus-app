import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { PERMISSIONS } from '../../../../core/auth/auth.models';
import { AuthorizationService } from '../../../../core/auth/authorization.service';
import { FeedbackService } from '../../../../core/services/feedback.service';
import { ParkingOccupancyStatus, ParkingSpot, ParkingType } from '../../models/parking.models';
import { ParkingApiService } from '../../services/parking-api.service';

@Component({
  selector: 'app-parking-detail-page',
  templateUrl: './parking-detail.page.html',
  styleUrls: ['./parking-detail.page.scss'],
  standalone: false,
})
export class ParkingDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly parkingApiService = inject(ParkingApiService);
  private readonly feedbackService = inject(FeedbackService);
  private readonly authService = inject(AuthService);
  private readonly authorizationService = inject(AuthorizationService);

  parking: ParkingSpot | null = null;
  loading = false;
  mutating = false;

  get canManageParking(): boolean {
    return this.authorizationService.hasPermission(PERMISSIONS.PARKING_SPACES_MANAGE);
  }

  ionViewWillEnter(): void {
    this.loadParking();
  }

  editParking(): void {
    if (!this.canManageParking || !this.parking) {
      return;
    }

    void this.router.navigate(['/parking', this.parking.id, 'edit']);
  }

  toggleActive(): void {
    if (!this.canManageParking || !this.parking || this.mutating) {
      return;
    }

    this.updateStatus(!this.parking.active, this.parking.occupancyStatus);
  }

  toggleServiceStatus(): void {
    if (!this.canManageParking || !this.parking || this.mutating) {
      return;
    }

    const nextStatus: ParkingOccupancyStatus = this.parking.occupancyStatus === 'FUERA_DE_SERVICIO'
      ? 'DISPONIBLE' : 'FUERA_DE_SERVICIO';
    this.updateStatus(this.parking.active, nextStatus);
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

  occupancyColor(status: ParkingOccupancyStatus): 'success' | 'warning' {
    return status === 'DISPONIBLE' ? 'success' : 'warning';
  }

  private loadParking(): void {
    const parkingId = this.route.snapshot.paramMap.get('id');
    if (!parkingId) {
      return;
    }

    this.loading = true;
    this.parkingApiService.getById(parkingId)
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: (parking) => {
          this.parking = parking;
        },
        error: async (error) => {
          await this.feedbackService.error(this.authService.getErrorMessage(error));
        },
      });
  }

  private updateStatus(active: boolean, occupancyStatus: ParkingOccupancyStatus): void {
    if (!this.canManageParking || !this.parking) {
      return;
    }

    this.mutating = true;
    this.parkingApiService.updateStatus(this.parking.id, { active, occupancyStatus })
      .pipe(finalize(() => {
        this.mutating = false;
      }))
      .subscribe({
        next: async (parking) => {
          this.parking = parking;
          await this.feedbackService.success('Estado actualizado correctamente.');
        },
        error: async (error) => {
          await this.feedbackService.error(this.authService.getErrorMessage(error));
        },
      });
  }
}
