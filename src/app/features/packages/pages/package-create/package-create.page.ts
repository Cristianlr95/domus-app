import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { FeedbackService } from '../../../../core/services/feedback.service';
import { CreatePackageRequest, PackageType } from '../../models/package.models';
import { PackagesApiService } from '../../services/packages-api.service';

@Component({
  selector: 'app-package-create-page',
  templateUrl: './package-create.page.html',
  styleUrls: ['./package-create.page.scss'],
  standalone: false,
})
export class PackageCreatePage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly packagesApiService = inject(PackagesApiService);
  private readonly feedbackService = inject(FeedbackService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly packageTypes: { value: PackageType; label: string }[] = [
    { value: 'PAQUETE', label: 'Paquete' },
    { value: 'DOCUMENTO', label: 'Documento' },
    { value: 'DELIVERY', label: 'Delivery' },
    { value: 'OTRO', label: 'Otro' },
  ];

  readonly form = this.formBuilder.nonNullable.group({
    description: ['', [Validators.required, Validators.maxLength(180)]],
    senderName: ['', [Validators.maxLength(150)]],
    packageType: ['PAQUETE' as PackageType, [Validators.required]],
    residentName: ['', [Validators.required, Validators.maxLength(150)]],
    unitLabel: ['', [Validators.maxLength(80)]],
    blockLabel: ['', [Validators.maxLength(80)]],
    receivedByName: ['', [Validators.maxLength(150)]],
    observations: ['', [Validators.maxLength(500)]],
  });

  submitting = false;

  submit(): void {
    if (this.form.invalid || this.submitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const payload = this.normalizePayload();

    this.packagesApiService.create(payload)
      .pipe(finalize(() => {
        this.submitting = false;
      }))
      .subscribe({
        next: async (packageItem) => {
          await this.feedbackService.success('Encomienda registrada correctamente.');
          await this.router.navigate(['/packages', packageItem.id]);
        },
        error: async (error) => {
          await this.feedbackService.error(this.authService.getErrorMessage(error));
        },
      });
  }

  private normalizePayload(): CreatePackageRequest {
    const raw = this.form.getRawValue();

    return {
      description: raw.description.trim(),
      senderName: raw.senderName.trim() || null,
      packageType: raw.packageType,
      residentName: raw.residentName.trim(),
      unitLabel: raw.unitLabel.trim() || null,
      blockLabel: raw.blockLabel.trim() || null,
      receivedByName: raw.receivedByName.trim() || null,
      observations: raw.observations.trim() || null,
    };
  }
}
