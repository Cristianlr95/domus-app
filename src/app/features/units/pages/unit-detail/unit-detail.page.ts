import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { FeedbackService } from '../../../../core/services/feedback.service';
import { ResidentType } from '../../../residents/models/resident.models';
import { Unit } from '../../models/unit.models';
import { UnitsApiService } from '../../services/units-api.service';

@Component({
  selector: 'app-unit-detail-page',
  templateUrl: './unit-detail.page.html',
  styleUrls: ['./unit-detail.page.scss'],
  standalone: false,
})
export class UnitDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly unitsApiService = inject(UnitsApiService);
  private readonly feedbackService = inject(FeedbackService);
  private readonly authService = inject(AuthService);

  unit: Unit | null = null;
  loading = false;
  mutating = false;

  ionViewWillEnter(): void {
    this.loadUnit();
  }

  editUnit(): void {
    if (!this.unit) {
      return;
    }

    void this.router.navigate(['/units', this.unit.id, 'edit']);
  }

  toggleStatus(): void {
    if (!this.unit || this.mutating) {
      return;
    }

    this.mutating = true;
    this.unitsApiService.updateStatus(this.unit.id, { active: !this.unit.active })
      .pipe(finalize(() => {
        this.mutating = false;
      }))
      .subscribe({
        next: async (unit) => {
          this.unit = unit;
          await this.feedbackService.success('Estado actualizado correctamente.');
        },
        error: async (error) => {
          await this.feedbackService.error(this.authService.getErrorMessage(error));
        },
      });
  }

  residentTypeLabel(type: ResidentType): string {
    switch (type) {
      case 'PROPIETARIO':
        return 'Propietario';
      case 'ARRENDATARIO':
        return 'Arrendatario';
      case 'OCUPANTE':
        return 'Ocupante';
    }
  }

  private loadUnit(): void {
    const unitId = this.route.snapshot.paramMap.get('id');
    if (!unitId) {
      return;
    }

    this.loading = true;
    this.unitsApiService.getById(unitId)
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: (unit) => {
          this.unit = unit;
        },
        error: async (error) => {
          await this.feedbackService.error(this.authService.getErrorMessage(error));
        },
      });
  }
}
