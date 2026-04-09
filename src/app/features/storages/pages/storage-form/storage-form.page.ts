import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { FeedbackService } from '../../../../core/services/feedback.service';
import { Unit } from '../../../units/models/unit.models';
import { UnitsApiService } from '../../../units/services/units-api.service';
import {
  CreateStorageRequest,
  StorageItem,
  StorageOccupancyStatus,
  StorageType,
  UpdateStorageRequest,
} from '../../models/storage.models';
import { StoragesApiService } from '../../services/storages-api.service';

@Component({
  selector: 'app-storage-form-page',
  templateUrl: './storage-form.page.html',
  styleUrls: ['./storage-form.page.scss'],
  standalone: false,
})
export class StorageFormPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly storagesApiService = inject(StoragesApiService);
  private readonly unitsApiService = inject(UnitsApiService);
  private readonly feedbackService = inject(FeedbackService);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly storageTypes: { value: StorageType; label: string }[] = [
    { value: 'PEQUENA', label: 'Pequena' },
    { value: 'MEDIANA', label: 'Mediana' },
    { value: 'GRANDE', label: 'Grande' },
  ];

  readonly occupancyStatuses: { value: StorageOccupancyStatus; label: string }[] = [
    { value: 'DISPONIBLE', label: 'Disponible' },
    { value: 'OCUPADA', label: 'Ocupada' },
  ];

  readonly form = this.formBuilder.nonNullable.group({
    storageCode: ['', [Validators.required, Validators.maxLength(50)]],
    storageType: ['MEDIANA' as StorageType, [Validators.required]],
    occupancyStatus: ['DISPONIBLE' as StorageOccupancyStatus, [Validators.required]],
    unitId: ['', [Validators.required]],
    observations: ['', [Validators.maxLength(500)]],
  });

  storage: StorageItem | null = null;
  units: Unit[] = [];
  loading = false;
  submitting = false;

  get isEditMode(): boolean {
    return !!this.route.snapshot.paramMap.get('id');
  }

  get title(): string {
    return this.isEditMode ? 'Editar bodega' : 'Nueva bodega';
  }

  ionViewWillEnter(): void {
    this.loadUnits();
    const storageId = this.route.snapshot.paramMap.get('id');
    if (storageId) {
      this.loadStorage(storageId);
    }
  }

  submit(): void {
    if (this.form.invalid || this.submitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const payload = this.normalizePayload();
    const storageId = this.route.snapshot.paramMap.get('id');
    const request$ = storageId
      ? this.storagesApiService.update(storageId, payload as UpdateStorageRequest)
      : this.storagesApiService.create(payload);

    request$
      .pipe(finalize(() => {
        this.submitting = false;
      }))
      .subscribe({
        next: async (storage) => {
          await this.feedbackService.success(
            storageId ? 'Bodega actualizada correctamente.' : 'Bodega registrada correctamente.'
          );
          await this.router.navigate(['/storages', storage.id]);
        },
        error: async (error) => {
          await this.feedbackService.error(this.authService.getErrorMessage(error));
        },
      });
  }

  private loadUnits(): void {
    this.unitsApiService.list(true, '')
      .subscribe({
        next: (units) => {
          this.units = units;
        },
        error: async (error) => {
          await this.feedbackService.error(this.authService.getErrorMessage(error));
        },
      });
  }

  private loadStorage(storageId: string): void {
    this.loading = true;
    this.storagesApiService.getById(storageId)
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: (storage) => {
          this.storage = storage;
          this.form.patchValue({
            storageCode: storage.storageCode,
            storageType: storage.storageType,
            occupancyStatus: storage.occupancyStatus,
            unitId: storage.unit.id,
            observations: storage.observations ?? '',
          });
        },
        error: async (error) => {
          await this.feedbackService.error(this.authService.getErrorMessage(error));
        },
      });
  }

  private normalizePayload(): CreateStorageRequest {
    const raw = this.form.getRawValue();

    return {
      storageCode: raw.storageCode.trim(),
      storageType: raw.storageType,
      occupancyStatus: raw.occupancyStatus,
      unitId: raw.unitId,
      observations: raw.observations.trim() || null,
    };
  }
}
