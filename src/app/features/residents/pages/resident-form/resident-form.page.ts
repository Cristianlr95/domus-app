import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { FeedbackService } from '../../../../core/services/feedback.service';
import { Unit } from '../../../units/models/unit.models';
import { UnitsApiService } from '../../../units/services/units-api.service';
import {
  CreateResidentRequest,
  Resident,
  ResidentLinkedUser,
  ResidentType,
  UpdateResidentRequest,
} from '../../models/resident.models';
import { ResidentsApiService } from '../../services/residents-api.service';

@Component({
  selector: 'app-resident-form-page',
  templateUrl: './resident-form.page.html',
  styleUrls: ['./resident-form.page.scss'],
  standalone: false,
})
export class ResidentFormPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly residentsApiService = inject(ResidentsApiService);
  private readonly unitsApiService = inject(UnitsApiService);
  private readonly feedbackService = inject(FeedbackService);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly residentTypes: { value: ResidentType; label: string }[] = [
    { value: 'PROPIETARIO', label: 'Propietario' },
    { value: 'ARRENDATARIO', label: 'Arrendatario' },
    { value: 'OCUPANTE', label: 'Ocupante' },
  ];

  readonly form = this.formBuilder.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    documentNumber: ['', [Validators.required, Validators.maxLength(50)]],
    email: ['', [Validators.email, Validators.maxLength(150)]],
    phone: ['', [Validators.maxLength(50)]],
    residentType: ['PROPIETARIO' as ResidentType, [Validators.required]],
    unitId: [''],
    linkedUserId: [''],
  });

  resident: Resident | null = null;
  linkableUsers: ResidentLinkedUser[] = [];
  units: Unit[] = [];
  loading = false;
  submitting = false;

  get isEditMode(): boolean {
    return !!this.route.snapshot.paramMap.get('id');
  }

  get title(): string {
    return this.isEditMode ? 'Editar residente' : 'Nuevo residente';
  }

  ionViewWillEnter(): void {
    this.loadUnits();
    const residentId = this.route.snapshot.paramMap.get('id');
    if (residentId) {
      this.loadResident(residentId);
      return;
    }

    this.loadLinkableUsers();
  }

  submit(): void {
    if (this.form.invalid || this.submitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const payload = this.normalizePayload();
    const residentId = this.route.snapshot.paramMap.get('id');
    const request$ = residentId
      ? this.residentsApiService.update(residentId, payload as UpdateResidentRequest)
      : this.residentsApiService.create(payload);

    request$
      .pipe(finalize(() => {
        this.submitting = false;
      }))
      .subscribe({
        next: async (resident) => {
          await this.feedbackService.success(
            residentId ? 'Residente actualizado correctamente.' : 'Residente registrado correctamente.'
          );
          await this.router.navigate(['/residents', resident.id]);
        },
        error: async (error) => {
          await this.feedbackService.error(this.authService.getErrorMessage(error));
        },
      });
  }

  private loadResident(residentId: string): void {
    this.loading = true;
    this.residentsApiService.getById(residentId)
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: (resident) => {
          this.resident = resident;
          this.form.patchValue({
            firstName: resident.firstName,
            lastName: resident.lastName,
            documentNumber: resident.documentNumber,
            email: resident.email ?? '',
            phone: resident.phone ?? '',
            residentType: resident.residentType,
            unitId: resident.unit?.id ?? '',
            linkedUserId: resident.linkedUser?.id ?? '',
          });
          this.loadLinkableUsers(resident.linkedUser?.id ?? null);
        },
        error: async (error) => {
          await this.feedbackService.error(this.authService.getErrorMessage(error));
        },
      });
  }

  private loadLinkableUsers(currentUserId?: string | null): void {
    this.residentsApiService.listLinkableUsers(currentUserId)
      .subscribe({
        next: (users) => {
          this.linkableUsers = users;
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

  private normalizePayload(): CreateResidentRequest {
    const raw = this.form.getRawValue();

    return {
      firstName: raw.firstName.trim(),
      lastName: raw.lastName.trim(),
      documentNumber: raw.documentNumber.trim(),
      email: raw.email.trim() || null,
      phone: raw.phone.trim() || null,
      residentType: raw.residentType,
      unitId: raw.unitId || null,
      linkedUserId: raw.linkedUserId || null,
    };
  }
}
