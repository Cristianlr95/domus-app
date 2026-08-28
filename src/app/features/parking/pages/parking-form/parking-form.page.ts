import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { FeedbackService } from '../../../../core/services/feedback.service';
import { Resident } from '../../../residents/models/resident.models';
import { ResidentsApiService } from '../../../residents/services/residents-api.service';
import { Unit } from '../../../units/models/unit.models';
import { UnitsApiService } from '../../../units/services/units-api.service';
import {
  CreateParkingRequest,
  ParkingOccupancyStatus,
  ParkingSpot,
  ParkingType,
  UpdateParkingRequest,
} from '../../models/parking.models';
import { ParkingApiService } from '../../services/parking-api.service';

@Component({
  selector: 'app-parking-form-page',
  templateUrl: './parking-form.page.html',
  styleUrls: ['./parking-form.page.scss'],
  standalone: false,
})
export class ParkingFormPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly parkingApiService = inject(ParkingApiService);
  private readonly unitsApiService = inject(UnitsApiService);
  private readonly residentsApiService = inject(ResidentsApiService);
  private readonly feedbackService = inject(FeedbackService);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly parkingTypes: { value: ParkingType; label: string }[] = [
    { value: 'RESIDENTE', label: 'Residente' },
    { value: 'VISITA', label: 'Visita' },
    { value: 'COMUN', label: 'Comun' },
  ];

  readonly occupancyStatuses: { value: ParkingOccupancyStatus; label: string }[] = [
    { value: 'DISPONIBLE', label: 'Disponible' },
    { value: 'FUERA_DE_SERVICIO', label: 'Fuera de servicio' },
  ];

  readonly form = this.formBuilder.nonNullable.group({
    spotCode: ['', [Validators.required, Validators.maxLength(50)]],
    parkingType: ['RESIDENTE' as ParkingType, [Validators.required]],
    occupancyStatus: ['DISPONIBLE' as ParkingOccupancyStatus, [Validators.required]],
    unitId: [''],
    residentId: [''],
    vehiclePlate: ['', [Validators.maxLength(20)]],
    observations: ['', [Validators.maxLength(500)]],
  });

  parking: ParkingSpot | null = null;
  units: Unit[] = [];
  residents: Resident[] = [];
  loading = false;
  submitting = false;

  get isEditMode(): boolean {
    return !!this.route.snapshot.paramMap.get('id');
  }

  get title(): string {
    return this.isEditMode ? 'Editar estacionamiento' : 'Nuevo estacionamiento';
  }

  ionViewWillEnter(): void {
    this.loadUnits();
    this.loadResidents();

    const parkingId = this.route.snapshot.paramMap.get('id');
    if (parkingId) {
      this.loadParking(parkingId);
    }
  }

  submit(): void {
    if (this.form.invalid || this.submitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const payload = this.normalizePayload();
    const parkingId = this.route.snapshot.paramMap.get('id');
    const request$ = parkingId
      ? this.parkingApiService.update(parkingId, payload as UpdateParkingRequest)
      : this.parkingApiService.create(payload);

    request$
      .pipe(finalize(() => {
        this.submitting = false;
      }))
      .subscribe({
        next: async (parking) => {
          await this.feedbackService.success(
            parkingId ? 'Estacionamiento actualizado correctamente.' : 'Estacionamiento registrado correctamente.'
          );
          await this.router.navigate(['/parking', parking.id]);
        },
        error: async (error) => {
          await this.feedbackService.error(this.authService.getErrorMessage(error));
        },
      });
  }

  private loadUnits(): void {
    this.unitsApiService.list('', '')
      .subscribe({
        next: (units) => {
          this.units = units;
        },
        error: async (error) => {
          await this.feedbackService.error(this.authService.getErrorMessage(error));
        },
      });
  }

  private loadResidents(): void {
    this.residentsApiService.list('', '')
      .subscribe({
        next: (residents) => {
          this.residents = residents;
        },
        error: async (error) => {
          await this.feedbackService.error(this.authService.getErrorMessage(error));
        },
      });
  }

  private loadParking(parkingId: string): void {
    this.loading = true;
    this.parkingApiService.getById(parkingId)
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: (parking) => {
          this.parking = parking;
          this.form.patchValue({
            spotCode: parking.spotCode,
            parkingType: parking.parkingType,
            occupancyStatus: parking.occupancyStatus,
            unitId: parking.unit?.id ?? '',
            residentId: parking.resident?.id ?? '',
            vehiclePlate: parking.vehiclePlate ?? '',
            observations: parking.observations ?? '',
          });
        },
        error: async (error) => {
          await this.feedbackService.error(this.authService.getErrorMessage(error));
        },
      });
  }

  private normalizePayload(): CreateParkingRequest {
    const raw = this.form.getRawValue();

    return {
      spotCode: raw.spotCode.trim(),
      parkingType: raw.parkingType,
      occupancyStatus: raw.occupancyStatus,
      unitId: raw.unitId || null,
      residentId: raw.residentId || null,
      vehiclePlate: raw.vehiclePlate.trim().toUpperCase() || null,
      observations: raw.observations.trim() || null,
    };
  }
}
