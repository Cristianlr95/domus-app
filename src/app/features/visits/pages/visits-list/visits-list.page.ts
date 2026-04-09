import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { FeedbackService } from '../../../../core/services/feedback.service';
import { Visit, VisitStatus } from '../../models/visit.models';
import { VisitsApiService } from '../../services/visits-api.service';

@Component({
  selector: 'app-visits-list-page',
  templateUrl: './visits-list.page.html',
  styleUrls: ['./visits-list.page.scss'],
  standalone: false,
})
export class VisitsListPage {
  private readonly visitsApiService = inject(VisitsApiService);
  private readonly feedbackService = inject(FeedbackService);
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly statuses: Array<VisitStatus | ''> = ['', 'PENDIENTE', 'INGRESADA', 'FINALIZADA', 'CANCELADA'];

  visits: Visit[] = [];
  loading = false;
  selectedStatus: VisitStatus | '' = '';
  search = '';

  ionViewWillEnter(): void {
    this.loadVisits();
  }

  loadVisits(): void {
    this.loading = true;
    this.visitsApiService.list(this.selectedStatus, this.search)
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: (visits) => {
          this.visits = visits;
        },
        error: async (error) => {
          await this.feedbackService.error(this.authService.getErrorMessage(error));
        },
      });
  }

  onFilterChange(): void {
    this.loadVisits();
  }

  openDetail(visitId: string): void {
    void this.router.navigate(['/visits', visitId]);
  }

  createVisit(): void {
    void this.router.navigate(['/visits/new']);
  }

  trackByVisit(_index: number, visit: Visit): string {
    return visit.id;
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

  statusColor(status: VisitStatus): 'warning' | 'primary' | 'success' | 'medium' {
    switch (status) {
      case 'PENDIENTE':
        return 'warning';
      case 'INGRESADA':
        return 'primary';
      case 'FINALIZADA':
        return 'success';
      case 'CANCELADA':
        return 'medium';
    }
  }
}
