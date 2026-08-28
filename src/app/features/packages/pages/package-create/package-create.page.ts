import { Component, Input, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { finalize, forkJoin, Observable } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { PERMISSIONS } from '../../../../core/auth/auth.models';
import { AuthorizationService } from '../../../../core/auth/authorization.service';
import { FeedbackService } from '../../../../core/services/feedback.service';
import { OperationsApiService } from '../../../operations/services/operations-api.service';
import { Resident } from '../../../residents/models/resident.models';
import { ResidentsApiService } from '../../../residents/services/residents-api.service';
import { CreatePackageRequest, PackageItem, PackageReceptionItem, PackageType } from '../../models/package.models';
import { PackagesApiService } from '../../services/packages-api.service';

interface ReceptionRecipient {
  resident: Resident;
  quantity: number;
}

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
  private readonly authorizationService = inject(AuthorizationService);

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
    trackingNumber: ['', [Validators.maxLength(120)]],
    packageType: ['PAQUETE' as PackageType, [Validators.required]],
    quantity: [1, [Validators.required, Validators.min(1), Validators.max(20)]],
    unitId: ['', [Validators.required]],
    residentId: ['', [Validators.required]],
    receivedByName: ['', [Validators.maxLength(150)]],
    observations: ['', [Validators.maxLength(500)]],
  });

  submitting = false;
  loadingRecipients = false;
  residents: Resident[] = [];
  recipientSearch = '';
  additionalRecipientSearch = '';
  additionalRecipients: ReceptionRecipient[] = [];
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

  get filteredAdditionalRecipients(): Resident[] {
    const term = this.additionalRecipientSearch.trim().toLocaleLowerCase('es');
    if (!term) {
      return [];
    }
    const alreadySelected = new Set([this.form.controls.residentId.value, ...this.additionalRecipients.map((item) => item.resident.id)]);
    return this.residents.filter((resident) => {
      if (alreadySelected.has(resident.id)) {
        return false;
      }
      return [resident.firstName, resident.lastName, resident.documentNumber, resident.unit?.unitCode, resident.unit?.blockLabel]
        .filter(Boolean).join(' ').toLocaleLowerCase('es').includes(term);
    }).slice(0, 8);
  }

  get totalReceptionPackages(): number {
    return Number(this.form.controls.quantity.value) + this.additionalRecipients.reduce((total, item) => total + Number(item.quantity || 0), 0);
  }

  get canManageCustody(): boolean {
    return this.authorizationService.hasPermission(PERMISSIONS.PACKAGES_CUSTODY_MANAGE);
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

  addAdditionalRecipient(resident: Resident): void {
    if (!resident.unit || this.totalReceptionPackages >= 20) {
      return;
    }
    this.additionalRecipients = [...this.additionalRecipients, { resident, quantity: 1 }];
    this.additionalRecipientSearch = '';
  }

  removeAdditionalRecipient(residentId: string): void {
    this.additionalRecipients = this.additionalRecipients.filter((item) => item.resident.id !== residentId);
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
    const raw = this.form.getRawValue();
    const resident = this.residents.find((item) => item.id === raw.residentId);
    const unit = resident?.unit;
    const payload = this.normalizePayload();

    if (this.canManageCustody && this.totalReceptionPackages > 20) {
      this.submitting = false;
      void this.feedbackService.error('Una recepción rápida admite hasta 20 encomiendas.');
      return;
    }

    const request$: Observable<PackageItem | Record<string, unknown>> = this.canManageCustody
      ? this.packagesApiService.createReception({
          carrier: raw.senderName.trim() || null,
          notes: raw.observations.trim() || null,
          packages: this.buildReceptionPackages(raw, resident),
        })
      : this.packagesApiService.create(payload);

    request$
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
          if ('id' in packageItem && typeof packageItem.id === 'string') {
            await this.router.navigate(['/packages', packageItem.id]);
            return;
          }
          await this.router.navigate(['/packages']);
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
      residentUserId: resident?.linkedUser?.id ?? null,
      residentName: resident ? `${resident.firstName} ${resident.lastName}` : '',
      unitLabel: unit?.unitCode ?? null,
      blockLabel: unit?.blockLabel ?? null,
      receivedByName: raw.receivedByName.trim() || null,
      observations: raw.observations.trim() || null,
    };
  }

  private buildReceptionPackages(raw: ReturnType<typeof this.form.getRawValue>, primaryResident: Resident | undefined): PackageReceptionItem[] {
    const recipients: ReceptionRecipient[] = primaryResident
      ? [{ resident: primaryResident, quantity: raw.quantity }, ...this.additionalRecipients]
      : [];
    return recipients.reduce((packages, { resident, quantity }) => {
      for (let index = 0; index < Number(quantity); index += 1) {
        packages.push({
          description: Number(quantity) > 1 ? `${raw.description.trim()} (${index + 1}/${quantity})` : raw.description.trim(),
          residentName: `${resident.firstName} ${resident.lastName}`,
          unitLabel: resident.unit?.unitCode ?? null,
          blockLabel: resident.unit?.blockLabel ?? null,
          trackingNumber: raw.trackingNumber.trim() || null,
          packageType: raw.packageType,
          residentUserId: resident.linkedUser?.id ?? null,
        });
      }
      return packages;
    }, [] as PackageReceptionItem[]);
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
