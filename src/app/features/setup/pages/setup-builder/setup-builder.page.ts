import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { FeedbackService } from '../../../../core/services/feedback.service';
import { SetupCondominium, SetupUnitSpec } from '../../models/setup.models';
import { SetupApiService } from '../../services/setup-api.service';

@Component({
  selector: 'app-setup-builder-page',
  templateUrl: './setup-builder.page.html',
  styleUrls: ['./setup-builder.page.scss'],
  standalone: false,
})
export class SetupBuilderPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly setupApi = inject(SetupApiService);
  private readonly feedback = inject(FeedbackService);
  private readonly auth = inject(AuthService);

  readonly condominiumForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(180)]],
    address: ['', [Validators.maxLength(300)]],
  });
  readonly sectionForm = this.formBuilder.nonNullable.group({
    code: ['', [Validators.required, Validators.maxLength(50)]],
    name: ['', [Validators.required, Validators.maxLength(120)]],
    type: ['TOWER', [Validators.required]],
  });
  readonly generatorForm = this.formBuilder.nonNullable.group({
    floorStart: [1, [Validators.required, Validators.min(-5), Validators.max(200)]],
    floorEnd: [7, [Validators.required, Validators.min(-5), Validators.max(200)]],
    unitsPerFloor: [5, [Validators.required, Validators.min(1), Validators.max(100)]],
    sectionCodes: [[] as string[], [Validators.required]],
  });
  readonly exceptionForm = this.formBuilder.nonNullable.group({
    floorNumber: [1, [Validators.required, Validators.min(-5), Validators.max(200)]],
    unitsPerFloor: [4, [Validators.required, Validators.min(0), Validators.max(100)]],
  });

  condominiums: SetupCondominium[] = [];
  sections: { id: string; condominiumId: string; code: string; name: string; type: string }[] = [];
  selectedCondominiumId = '';
  previewUnits: SetupUnitSpec[] = [];
  floorExceptions: { floorNumber: number; unitsPerFloor: number }[] = [];
  batchId = '';
  loading = false;
  saving = false;

  ionViewWillEnter(): void { this.loadCondominiums(); }

  get selectedCondominium(): SetupCondominium | null {
    return this.condominiums.find((item) => item.id === this.selectedCondominiumId) ?? null;
  }

  get selectedSections(): { id: string; condominiumId: string; code: string; name: string; type: string }[] {
    return this.sections.filter((section) => section.condominiumId === this.selectedCondominiumId);
  }

  get selectedGeneratorSections(): { id: string; condominiumId: string; code: string; name: string; type: string }[] {
    const selected = new Set(this.generatorForm.controls.sectionCodes.value);
    return this.selectedSections.filter((section) => selected.has(section.code));
  }

  createCondominium(): void {
    if (this.condominiumForm.invalid || this.saving) { this.condominiumForm.markAllAsTouched(); return; }
    this.saving = true;
    const value = this.condominiumForm.getRawValue();
    this.setupApi.createCondominium({ name: value.name.trim(), address: value.address.trim() })
      .pipe(finalize(() => this.saving = false)).subscribe({
        next: async (result) => { this.selectedCondominiumId = result.id; this.condominiumForm.reset(); await this.feedback.success('Condominio creado en estado Setup.'); this.loadCondominiums(); },
        error: async (error) => this.feedback.error(this.auth.getErrorMessage(error)),
      });
  }

  createSection(): void {
    if (!this.selectedCondominiumId) { void this.feedback.error('Selecciona primero un condominio.'); return; }
    if (this.sectionForm.invalid || this.saving) { this.sectionForm.markAllAsTouched(); return; }
    this.saving = true;
    const value = this.sectionForm.getRawValue();
    this.setupApi.createSection(this.selectedCondominiumId, { code: value.code.trim(), name: value.name.trim(), type: value.type })
      .pipe(finalize(() => this.saving = false)).subscribe({
        next: async () => {
          this.generatorForm.controls.sectionCodes.setValue([
            ...new Set([...this.generatorForm.controls.sectionCodes.value, value.code.trim()]),
          ]);
          this.sectionForm.reset({ code: '', name: '', type: 'TOWER' });
          await this.feedback.success('Torre, sector o bloque agregado. Puedes añadir otro.');
          this.loadCondominiums();
        },
        error: async (error) => this.feedback.error(this.auth.getErrorMessage(error)),
      });
  }

  generatePreview(): void {
    if (!this.selectedCondominiumId) { void this.feedback.error('Selecciona primero un condominio.'); return; }
    if (!this.generatorForm.controls.sectionCodes.value.length) {
      this.generatorForm.controls.sectionCodes.markAsTouched();
      void this.feedback.error('Selecciona una o más torres, sectores o bloques.');
      return;
    }
    if (this.generatorForm.invalid) { this.generatorForm.markAllAsTouched(); return; }
    const value = this.generatorForm.getRawValue();
    if (value.floorEnd < value.floorStart) { void this.feedback.error('El último piso debe ser mayor o igual al primero.'); return; }
    const exceptionByFloor = new Map(this.floorExceptions.map((item) => [item.floorNumber, item.unitsPerFloor]));
    this.previewUnits = [];
    for (const section of this.selectedGeneratorSections) {
      for (let floor = value.floorStart; floor <= value.floorEnd; floor++) {
        const unitsOnFloor = exceptionByFloor.get(floor) ?? value.unitsPerFloor;
        for (let ordinal = 1; ordinal <= unitsOnFloor; ordinal++) {
          const unitCode = `${floor}${String(ordinal).padStart(2, '0')}`;
          this.previewUnits.push({ blockLabel: section.code, unitCode, floorNumber: floor });
        }
      }
    }
    this.batchId = '';
  }

  removePreviewUnit(index: number): void { this.previewUnits.splice(index, 1); }

  addFloorException(): void {
    if (this.exceptionForm.invalid) { this.exceptionForm.markAllAsTouched(); return; }
    const value = this.exceptionForm.getRawValue();
    const generator = this.generatorForm.getRawValue();
    if (value.floorNumber < generator.floorStart || value.floorNumber > generator.floorEnd) {
      this.generatorForm.patchValue({
        floorStart: Math.min(value.floorNumber, generator.floorStart),
        floorEnd: Math.max(value.floorNumber, generator.floorEnd),
      });
      this.previewUnits = [];
      this.batchId = '';
      void this.feedback.success(`El rango se amplió para incluir el piso ${value.floorNumber}. Genera un nuevo preview para aplicar la excepción.`);
    }
    this.floorExceptions = [
      ...this.floorExceptions.filter((item) => item.floorNumber !== value.floorNumber),
      value,
    ].sort((left, right) => left.floorNumber - right.floorNumber);
    this.previewUnits = [];
    this.batchId = '';
  }

  removeFloorException(floorNumber: number): void {
    this.floorExceptions = this.floorExceptions.filter((item) => item.floorNumber !== floorNumber);
  }

  savePreview(): void {
    if (!this.selectedCondominiumId || !this.previewUnits.length || this.saving) return;
    this.saving = true;
    this.setupApi.preview(this.selectedCondominiumId, 'Structure Builder DOMUS', this.previewUnits)
      .pipe(finalize(() => this.saving = false)).subscribe({
        next: async (result) => { this.batchId = result.id; await this.feedback.success(`Preview guardado: ${this.previewUnits.length} unidades listas para confirmar.`); },
        error: async (error) => this.feedback.error(this.auth.getErrorMessage(error)),
      });
  }

  confirmStructure(): void {
    if (!this.batchId || this.saving) return;
    this.saving = true;
    this.setupApi.commit(this.batchId).pipe(finalize(() => this.saving = false)).subscribe({
      next: async () => { await this.feedback.success('Estructura confirmada y auditada correctamente.'); this.batchId = ''; this.previewUnits = []; },
      error: async (error) => this.feedback.error(this.auth.getErrorMessage(error)),
    });
  }

  private loadCondominiums(): void {
    this.loading = true;
    forkJoin({ condominiums: this.setupApi.listCondominiums(), sections: this.setupApi.listSections() })
      .pipe(finalize(() => this.loading = false)).subscribe({
      next: ({ condominiums, sections }) => {
        this.condominiums = condominiums;
        this.sections = sections.map((item) => ({
          id: String(item['id']), condominiumId: String(item['condominium_id']), code: String(item['code']),
          name: String(item['name']), type: String(item['section_type']),
        }));
        if (!this.selectedCondominiumId && condominiums.length) this.selectedCondominiumId = condominiums[0].id;
      },
      error: async (error) => this.feedback.error(this.auth.getErrorMessage(error)),
    });
  }
}
