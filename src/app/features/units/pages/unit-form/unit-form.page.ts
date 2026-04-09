import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { FeedbackService } from '../../../../core/services/feedback.service';
import { Resident } from '../../../residents/models/resident.models';
import { ResidentsApiService } from '../../../residents/services/residents-api.service';
import { CreateUnitRequest, Unit, UpdateUnitRequest } from '../../models/unit.models';
import { UnitsApiService } from '../../services/units-api.service';

@Component({
  selector: 'app-unit-form-page',
  templateUrl: './unit-form.page.html',
  styleUrls: ['./unit-form.page.scss'],
  standalone: false,
})
export class UnitFormPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly unitsApiService = inject(UnitsApiService);
  private readonly residentsApiService = inject(ResidentsApiService);
  private readonly feedbackService = inject(FeedbackService);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly form = this.formBuilder.nonNullable.group({
    unitCode: ['', [Validators.required, Validators.maxLength(50)]],
    blockLabel: ['', [Validators.required, Validators.maxLength(80)]],
    floorNumber: [''],
    observations: ['', [Validators.maxLength(500)]],
    residentIds: [[] as string[]],
  });

  unit: Unit | null = null;
  residents: Resident[] = [];
  loading = false;
  submitting = false;

  get isEditMode(): boolean {
    return !!this.route.snapshot.paramMap.get('id');
  }

  get title(): string {
    return this.isEditMode ? 'Editar unidad' : 'Nueva unidad';
  }

  ionViewWillEnter(): void {
    this.loadResidents();
    const unitId = this.route.snapshot.paramMap.get('id');
    if (unitId) {
      this.loadUnit(unitId);
    }
  }

  submit(): void {
    if (this.form.invalid || this.submitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const payload = this.normalizePayload();
    const unitId = this.route.snapshot.paramMap.get('id');
    const request$ = unitId
      ? this.unitsApiService.update(unitId, payload as UpdateUnitRequest)
      : this.unitsApiService.create(payload);

    request$
      .pipe(finalize(() => {
        this.submitting = false;
      }))
      .subscribe({
        next: async (unit) => {
          await this.feedbackService.success(
            unitId ? 'Unidad actualizada correctamente.' : 'Unidad registrada correctamente.'
          );
          await this.router.navigate(['/units', unit.id]);
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

  private loadUnit(unitId: string): void {
    this.loading = true;
    this.unitsApiService.getById(unitId)
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: (unit) => {
          this.unit = unit;
          this.form.patchValue({
            unitCode: unit.unitCode,
            blockLabel: unit.blockLabel,
            floorNumber: unit.floorNumber === null ? '' : String(unit.floorNumber),
            observations: unit.observations ?? '',
            residentIds: unit.residents.map((resident) => resident.id),
          });
        },
        error: async (error) => {
          await this.feedbackService.error(this.authService.getErrorMessage(error));
        },
      });
  }

  private normalizePayload(): CreateUnitRequest {
    const raw = this.form.getRawValue();

    return {
      unitCode: raw.unitCode.trim(),
      blockLabel: raw.blockLabel.trim(),
      floorNumber: raw.floorNumber === '' ? null : Number(raw.floorNumber),
      observations: raw.observations.trim() || null,
      residentIds: raw.residentIds,
    };
  }
}
