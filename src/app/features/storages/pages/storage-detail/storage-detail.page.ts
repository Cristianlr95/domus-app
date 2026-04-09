import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { FeedbackService } from '../../../../core/services/feedback.service';
import { StorageItem, StorageOccupancyStatus, StorageType } from '../../models/storage.models';
import { StoragesApiService } from '../../services/storages-api.service';

@Component({
  selector: 'app-storage-detail-page',
  templateUrl: './storage-detail.page.html',
  styleUrls: ['./storage-detail.page.scss'],
  standalone: false,
})
export class StorageDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly storagesApiService = inject(StoragesApiService);
  private readonly feedbackService = inject(FeedbackService);
  private readonly authService = inject(AuthService);

  storage: StorageItem | null = null;
  loading = false;
  mutating = false;

  ionViewWillEnter(): void {
    this.loadStorage();
  }

  editStorage(): void {
    if (!this.storage) {
      return;
    }

    void this.router.navigate(['/storages', this.storage.id, 'edit']);
  }

  toggleActive(): void {
    if (!this.storage || this.mutating) {
      return;
    }

    const nextActive = !this.storage.active;
    const nextOccupancyStatus = nextActive ? this.storage.occupancyStatus : 'DISPONIBLE';
    this.updateStatus(nextActive, nextOccupancyStatus);
  }

  toggleOccupancy(): void {
    if (!this.storage || this.mutating || !this.storage.active) {
      return;
    }

    const nextStatus: StorageOccupancyStatus =
      this.storage.occupancyStatus === 'DISPONIBLE' ? 'OCUPADA' : 'DISPONIBLE';
    this.updateStatus(this.storage.active, nextStatus);
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

  occupancyColor(status: StorageOccupancyStatus): 'success' | 'warning' {
    return status === 'DISPONIBLE' ? 'success' : 'warning';
  }

  private loadStorage(): void {
    const storageId = this.route.snapshot.paramMap.get('id');
    if (!storageId) {
      return;
    }

    this.loading = true;
    this.storagesApiService.getById(storageId)
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: (storage) => {
          this.storage = storage;
        },
        error: async (error) => {
          await this.feedbackService.error(this.authService.getErrorMessage(error));
        },
      });
  }

  private updateStatus(active: boolean, occupancyStatus: StorageOccupancyStatus): void {
    if (!this.storage) {
      return;
    }

    this.mutating = true;
    this.storagesApiService.updateStatus(this.storage.id, { active, occupancyStatus })
      .pipe(finalize(() => {
        this.mutating = false;
      }))
      .subscribe({
        next: async (storage) => {
          this.storage = storage;
          await this.feedbackService.success('Estado actualizado correctamente.');
        },
        error: async (error) => {
          await this.feedbackService.error(this.authService.getErrorMessage(error));
        },
      });
  }
}
