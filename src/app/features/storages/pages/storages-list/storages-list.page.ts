import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { PERMISSIONS } from '../../../../core/auth/auth.models';
import { AuthorizationService } from '../../../../core/auth/authorization.service';
import { FeedbackService } from '../../../../core/services/feedback.service';
import { Unit } from '../../../units/models/unit.models';
import { UnitsApiService } from '../../../units/services/units-api.service';
import { StorageItem, StorageOccupancyStatus, StorageType } from '../../models/storage.models';
import { StoragesApiService } from '../../services/storages-api.service';

@Component({
  selector: 'app-storages-list-page',
  templateUrl: './storages-list.page.html',
  styleUrls: ['./storages-list.page.scss'],
  standalone: false,
})
export class StoragesListPage {
  private readonly storagesApiService = inject(StoragesApiService);
  private readonly unitsApiService = inject(UnitsApiService);
  private readonly feedbackService = inject(FeedbackService);
  readonly authService = inject(AuthService);
  private readonly authorizationService = inject(AuthorizationService);
  private readonly router = inject(Router);

  storages: StorageItem[] = [];
  units: Unit[] = [];
  loading = false;
  selectedActive: boolean | '' = '';
  selectedOccupancyStatus: StorageOccupancyStatus | '' = '';
  selectedUnitId = '';
  search = '';

  get canManageStorages(): boolean {
    return this.authorizationService.hasPermission(PERMISSIONS.STORAGES_MANAGE);
  }

  ionViewWillEnter(): void {
    this.loadUnits();
    this.loadStorages();
  }

  loadStorages(): void {
    this.loading = true;
    this.storagesApiService.list(this.selectedActive, this.selectedOccupancyStatus, this.selectedUnitId, this.search)
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: (storages) => {
          this.storages = storages;
        },
        error: async (error) => {
          await this.feedbackService.error(this.authService.getErrorMessage(error));
        },
      });
  }

  onFilterChange(): void {
    this.loadStorages();
  }

  createStorage(): void {
    if (!this.canManageStorages) {
      return;
    }

    void this.router.navigate(['/storages/new']);
  }

  openDetail(storageId: string): void {
    void this.router.navigate(['/storages', storageId]);
  }

  trackByStorage(_index: number, storage: StorageItem): string {
    return storage.id;
  }

  occupancyColor(status: StorageOccupancyStatus): 'success' | 'warning' {
    return status === 'DISPONIBLE' ? 'success' : 'warning';
  }

  typeLabel(type: StorageType): string {
    switch (type) {
      case 'PEQUENA':
        return 'Pequena';
      case 'MEDIANA':
        return 'Mediana';
      case 'GRANDE':
        return 'Grande';
    }
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
}
