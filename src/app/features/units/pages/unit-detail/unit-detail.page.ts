import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { PERMISSIONS } from '../../../../core/auth/auth.models';
import { AuthorizationService } from '../../../../core/auth/authorization.service';
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
  private readonly authorizationService = inject(AuthorizationService);
  private readonly alertController = inject(AlertController);

  unit: Unit | null = null;
  loading = false;
  mutating = false;

  get canManageUnits(): boolean {
    return this.authorizationService.hasPermission(PERMISSIONS.UNITS_MANAGE);
  }

  ionViewWillEnter(): void {
    this.loadUnit();
  }

  editUnit(): void {
    if (!this.canManageUnits || !this.unit) {
      return;
    }

    void this.router.navigate(['/units', this.unit.id, 'edit']);
  }

  async requestStatusChange(): Promise<void> {
    if (!this.canManageUnits || !this.unit || this.mutating) {
      return;
    }

    if (!this.unit.active) {
      this.toggleStatus();
      return;
    }

    const alert = await this.alertController.create({
      header: 'Marcar unidad como inactiva',
      message: 'La unidad dejará de estar disponible para la operación habitual. Podrás reactivarla posteriormente.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Marcar inactiva', role: 'destructive' },
      ],
    });
    await alert.present();
    const result = await alert.onDidDismiss();
    if (result.role === 'destructive') {
      this.toggleStatus();
    }
  }

  private toggleStatus(): void {
    if (!this.canManageUnits || !this.unit || this.mutating) {
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
