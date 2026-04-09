import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { FeedbackService } from '../../../../core/services/feedback.service';
import { CreateVisitRequest, VisitRegistrationType } from '../../models/visit.models';
import { VisitsApiService } from '../../services/visits-api.service';

@Component({
  selector: 'app-visit-create-page',
  templateUrl: './visit-create.page.html',
  styleUrls: ['./visit-create.page.scss'],
  standalone: false,
})
export class VisitCreatePage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly visitsApiService = inject(VisitsApiService);
  private readonly feedbackService = inject(FeedbackService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly registrationTypes: { value: VisitRegistrationType; label: string }[] = [
    { value: 'MANUAL_CONSERJERIA', label: 'Manual conserjería' },
    { value: 'PREAUTORIZADA_RESIDENTE', label: 'Preautorizada residente' },
  ];

  readonly form = this.formBuilder.nonNullable.group({
    visitorName: ['', [Validators.required, Validators.maxLength(150)]],
    visitorDocument: ['', [Validators.required, Validators.maxLength(50)]],
    visitorPhone: ['', [Validators.maxLength(50)]],
    vehiclePlate: ['', [Validators.maxLength(20)]],
    residentName: ['', [Validators.required, Validators.maxLength(150)]],
    unitLabel: ['', [Validators.maxLength(80)]],
    blockLabel: ['', [Validators.maxLength(80)]],
    observations: ['', [Validators.maxLength(500)]],
    registrationType: ['MANUAL_CONSERJERIA' as VisitRegistrationType, [Validators.required]],
  });

  submitting = false;

  submit(): void {
    if (this.form.invalid || this.submitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const payload = this.normalizePayload();

    this.visitsApiService.create(payload)
      .pipe(finalize(() => {
        this.submitting = false;
      }))
      .subscribe({
        next: async (visit) => {
          await this.feedbackService.success('Visita registrada correctamente.');
          await this.router.navigate(['/visits', visit.id]);
        },
        error: async (error) => {
          await this.feedbackService.error(this.authService.getErrorMessage(error));
        },
      });
  }

  private normalizePayload(): CreateVisitRequest {
    const raw = this.form.getRawValue();

    return {
      visitorName: raw.visitorName.trim(),
      visitorDocument: raw.visitorDocument.trim(),
      visitorPhone: raw.visitorPhone.trim() || null,
      vehiclePlate: raw.vehiclePlate.trim() || null,
      residentName: raw.residentName.trim(),
      unitLabel: raw.unitLabel.trim() || null,
      blockLabel: raw.blockLabel.trim() || null,
      observations: raw.observations.trim() || null,
      registrationType: raw.registrationType,
    };
  }
}
