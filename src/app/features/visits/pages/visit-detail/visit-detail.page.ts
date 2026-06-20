import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { PERMISSIONS } from '../../../../core/auth/auth.models';
import { AuthorizationService } from '../../../../core/auth/authorization.service';
import { FeedbackService } from '../../../../core/services/feedback.service';
import { Visit, VisitStatus } from '../../models/visit.models';
import { VisitsApiService } from '../../services/visits-api.service';

@Component({
  selector: 'app-visit-detail-page',
  templateUrl: './visit-detail.page.html',
  styleUrls: ['./visit-detail.page.scss'],
  standalone: false,
})
export class VisitDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly visitsApiService = inject(VisitsApiService);
  private readonly feedbackService = inject(FeedbackService);
  private readonly authService = inject(AuthService);
  private readonly authorizationService = inject(AuthorizationService);

  visit: Visit | null = null;
  loading = false;
  mutating = false;

  get canUpdateVisits(): boolean {
    return this.authorizationService.hasPermission(PERMISSIONS.VISITS_UPDATE);
  }

  ionViewWillEnter(): void {
    this.loadVisit();
  }

  loadVisit(): void {
    const visitId = this.route.snapshot.paramMap.get('id');
    if (!visitId) {
      return;
    }

    this.loading = true;
    this.visitsApiService.getById(visitId)
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: (visit) => {
          this.visit = visit;
        },
        error: async (error) => {
          await this.feedbackService.error(this.authService.getErrorMessage(error));
        },
      });
  }

  updateStatus(status: VisitStatus): void {
    if (!this.canUpdateVisits || !this.visit || this.mutating) {
      return;
    }

    this.mutating = true;
    this.visitsApiService.updateStatus(this.visit.id, { status })
      .pipe(finalize(() => {
        this.mutating = false;
      }))
      .subscribe({
        next: async (visit) => {
          this.visit = visit;
          await this.feedbackService.success('Estado actualizado correctamente.');
        },
        error: async (error) => {
          await this.feedbackService.error(this.authService.getErrorMessage(error));
        },
      });
  }

  availableNextStatuses(status: VisitStatus): VisitStatus[] {
    switch (status) {
      case 'PENDIENTE':
        return ['INGRESADA', 'CANCELADA'];
      case 'INGRESADA':
        return ['FINALIZADA', 'CANCELADA'];
      default:
        return [];
    }
  }

  statusLabel(status: VisitStatus): string {
    switch (status) {
      case 'PENDIENTE':
        return 'Pendiente';
      case 'INGRESADA':
        return 'Ingresada';
      case 'FINALIZADA':
        return 'Finalizada';
      case 'CANCELADA':
        return 'Cancelada';
    }
  }
}
