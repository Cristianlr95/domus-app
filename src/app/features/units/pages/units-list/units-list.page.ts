import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { PERMISSIONS } from '../../../../core/auth/auth.models';
import { AuthorizationService } from '../../../../core/auth/authorization.service';
import { FeedbackService } from '../../../../core/services/feedback.service';
import { Unit } from '../../models/unit.models';
import { UnitsApiService } from '../../services/units-api.service';

@Component({
  selector: 'app-units-list-page',
  templateUrl: './units-list.page.html',
  styleUrls: ['./units-list.page.scss'],
  standalone: false,
})
export class UnitsListPage {
  private readonly unitsApiService = inject(UnitsApiService);
  private readonly feedbackService = inject(FeedbackService);
  readonly authService = inject(AuthService);
  private readonly authorizationService = inject(AuthorizationService);
  private readonly router = inject(Router);

  units: Unit[] = [];
  loading = false;
  selectedActive: boolean | '' = '';
  search = '';
  selectedUnit: Unit | null = null;
  private pendingDetailUnitId = '';

  get canManageUnits(): boolean {
    return this.authorizationService.hasPermission(PERMISSIONS.UNITS_MANAGE);
  }

  ionViewWillEnter(): void {
    this.loadUnits();
  }

  loadUnits(): void {
    this.loading = true;
    this.unitsApiService.list(this.selectedActive, this.search)
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: (units) => {
          this.units = units;
        },
        error: async (error) => {
          await this.feedbackService.error(this.authService.getErrorMessage(error));
        },
      });
  }

  onFilterChange(): void {
    this.loadUnits();
  }

  createUnit(): void {
    if (!this.canManageUnits) {
      return;
    }

    void this.router.navigate(['/units/new']);
  }

  get towerGroups(): { label: string; units: Unit[] }[] {
    const byTower = new Map<string, Unit[]>();
    for (const unit of this.units) {
      const tower = unit.blockLabel?.trim() || 'Sin estructura';
      byTower.set(tower, [...(byTower.get(tower) ?? []), unit]);
    }

    return [...byTower.entries()]
      .sort(([left], [right]) => left.localeCompare(right, 'es'))
      .map(([label, units]) => ({
        label,
        units: [...units].sort((left, right) =>
          (left.floorNumber ?? Number.MAX_SAFE_INTEGER) - (right.floorNumber ?? Number.MAX_SAFE_INTEGER)
          || left.unitCode.localeCompare(right.unitCode, 'es', { numeric: true }),
        ),
      }));
  }

  showUnit(unit: Unit): void {
    this.selectedUnit = unit;
  }

  closeUnitModal(): void {
    this.selectedUnit = null;
  }

  onUnitModalDismiss(): void {
    this.selectedUnit = null;
    if (!this.pendingDetailUnitId) {
      return;
    }

    const unitId = this.pendingDetailUnitId;
    this.pendingDetailUnitId = '';
    void this.router.navigate(['/units', unitId]);
  }

  manageUnitFromModal(unitId: string): void {
    this.pendingDetailUnitId = unitId;
    this.closeUnitModal();
  }

  openDetail(unitId: string): void {
    void this.router.navigate(['/units', unitId]);
  }

  trackByUnit(_index: number, unit: Unit): string {
    return unit.id;
  }
}
