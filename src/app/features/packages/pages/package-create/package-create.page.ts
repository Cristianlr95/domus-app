import { Component, Input, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { FeedbackService } from '../../../../core/services/feedback.service';
import { OperationsApiService } from '../../../operations/services/operations-api.service';
import { Resident } from '../../../residents/models/resident.models';
import { ResidentsApiService } from '../../../residents/services/residents-api.service';
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
  private readonly modalController = inject(ModalController);
  private readonly residentsApiService = inject(ResidentsApiService);
  private readonly operationsApiService = inject(OperationsApiService);

  @Input() modalMode = false;

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
    unitId: ['', [Validators.required]],
    residentId: ['', [Validators.required]],
    receivedByName: ['', [Validators.maxLength(150)]],
    observations: ['', [Validators.maxLength(500)]],
  });

  submitting = false;
  loadingRecipients = false;
  residents: Resident[] = [];
  recipientSearch = '';
  buildingName = '';

  get filteredResidents(): Resident[] {
    const term = this.recipientSearch.trim().toLocaleLowerCase('es');
    if (!term) {
      return [];
    }

    return this.residents
      .filter((resident) => {
        const unit = resident.unit;
        const searchable = [
          resident.firstName,
          resident.lastName,
          resident.documentNumber,
          unit?.unitCode,
          unit?.blockLabel,
        ]
          .filter(Boolean)
          .join(' ')
          .toLocaleLowerCase('es');
        return searchable.includes(term);
      })
      .slice(0, 8);
  }

  get selectedResident(): Resident | null {
    return this.residents.find((resident) => resident.id === this.form.controls.residentId.value) ?? null;
  }

  get selectedUnitLabel(): string {
    const unit = this.selectedResident?.unit;
    return unit ? `${unit.blockLabel} · Depto. ${unit.unitCode}` : '';
  }

  get recipientBuildingLabel(): string {
    return this.buildingName || 'Edificio asociado';
  }

  ionViewWillEnter(): void {
    this.loadRecipients();
  }

  selectResident(resident: Resident): void {
    if (!resident.unit) {
      return;
    }

    this.form.patchValue({ unitId: resident.unit.id, residentId: resident.id });
    this.recipientSearch = '';
  }

  clearRecipient(): void {
    this.form.patchValue({ unitId: '', residentId: '' });
    this.recipientSearch = '';
  }

  async cancel(): Promise<void> {
    if (this.modalMode) {
      await this.modalController.dismiss(null, 'cancel');
      return;
    }

    await this.router.navigate(['/packages']);
  }

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
          if (this.modalMode) {
            await this.modalController.dismiss(packageItem, 'created');
            return;
          }
          await this.router.navigate(['/packages', packageItem.id]);
        },
        error: async (error) => {
          await this.feedbackService.error(this.authService.getErrorMessage(error));
        },
      });
  }

  private normalizePayload(): CreatePackageRequest {
    const raw = this.form.getRawValue();
    const resident = this.residents.find((item) => item.id === raw.residentId);
    const unit = resident?.unit;

    return {
      description: raw.description.trim(),
      senderName: raw.senderName.trim() || null,
      packageType: raw.packageType,
      residentName: resident ? `${resident.firstName} ${resident.lastName}` : '',
      unitLabel: unit?.unitCode ?? null,
      blockLabel: unit?.blockLabel ?? null,
      receivedByName: raw.receivedByName.trim() || null,
      observations: raw.observations.trim() || null,
    };
  }

  private loadRecipients(): void {
    this.loadingRecipients = true;
    forkJoin({
      residents: this.residentsApiService.list(true, ''),
      condominiums: this.operationsApiService.list('condominiums'),
    })
      .pipe(finalize(() => {
        this.loadingRecipients = false;
      }))
      .subscribe({
        next: ({ residents, condominiums }) => {
          this.residents = [...residents]
            .filter((resident) => resident.active && resident.unit)
            .sort((left, right) =>
              `${left.lastName} ${left.firstName}`.localeCompare(`${right.lastName} ${right.firstName}`, 'es')
            );
          const activeCondominium = condominiums.find((item) => item['status'] === 'ACTIVE');
          this.buildingName = String(activeCondominium?.['name'] ?? '');
        },
        error: async (error) => {
          await this.feedbackService.error(this.authService.getErrorMessage(error));
        },
      });
  }
}
