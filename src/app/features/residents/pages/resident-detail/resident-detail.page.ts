import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { PERMISSIONS } from '../../../../core/auth/auth.models';
import { AuthorizationService } from '../../../../core/auth/authorization.service';
import { FeedbackService } from '../../../../core/services/feedback.service';
import { Resident, ResidentType } from '../../models/resident.models';
import { ResidentsApiService } from '../../services/residents-api.service';

@Component({
  selector: 'app-resident-detail-page',
  templateUrl: './resident-detail.page.html',
  styleUrls: ['./resident-detail.page.scss'],
  standalone: false,
})
export class ResidentDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly residentsApiService = inject(ResidentsApiService);
  private readonly feedbackService = inject(FeedbackService);
  private readonly authService = inject(AuthService);
  private readonly authorizationService = inject(AuthorizationService);

  resident: Resident | null = null;
  loading = false;
  mutating = false;

  get canManageResidents(): boolean {
    return this.authorizationService.hasPermission(PERMISSIONS.RESIDENTS_MANAGE);
  }

  ionViewWillEnter(): void {
    this.loadResident();
  }

  editResident(): void {
    if (!this.canManageResidents || !this.resident) {
      return;
    }

    void this.router.navigate(['/residents', this.resident.id, 'edit']);
  }

  toggleStatus(): void {
    if (!this.canManageResidents || !this.resident || this.mutating) {
      return;
    }

    this.mutating = true;
    this.residentsApiService.updateStatus(this.resident.id, { active: !this.resident.active })
      .pipe(finalize(() => {
        this.mutating = false;
      }))
      .subscribe({
        next: async (resident) => {
          this.resident = resident;
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

  private loadResident(): void {
    const residentId = this.route.snapshot.paramMap.get('id');
    if (!residentId) {
      return;
    }

    this.loading = true;
    this.residentsApiService.getById(residentId)
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: (resident) => {
          this.resident = resident;
        },
        error: async (error) => {
          await this.feedbackService.error(this.authService.getErrorMessage(error));
        },
      });
  }
}
