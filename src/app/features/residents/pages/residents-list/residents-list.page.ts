import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { PERMISSIONS } from '../../../../core/auth/auth.models';
import { AuthorizationService } from '../../../../core/auth/authorization.service';
import { FeedbackService } from '../../../../core/services/feedback.service';
import { Resident } from '../../models/resident.models';
import { ResidentsApiService } from '../../services/residents-api.service';

@Component({
  selector: 'app-residents-list-page',
  templateUrl: './residents-list.page.html',
  styleUrls: ['./residents-list.page.scss'],
  standalone: false,
})
export class ResidentsListPage {
  private readonly residentsApiService = inject(ResidentsApiService);
  private readonly feedbackService = inject(FeedbackService);
  readonly authService = inject(AuthService);
  private readonly authorizationService = inject(AuthorizationService);
  private readonly router = inject(Router);

  residents: Resident[] = [];
  loading = false;
  selectedActive: boolean | '' = '';
  search = '';

  get canManageResidents(): boolean {
    return this.authorizationService.hasPermission(PERMISSIONS.RESIDENTS_MANAGE);
  }

  ionViewWillEnter(): void {
    this.loadResidents();
  }

  loadResidents(): void {
    this.loading = true;
    this.residentsApiService.list(this.selectedActive, this.search)
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: (residents) => {
          this.residents = residents;
        },
        error: async (error) => {
          await this.feedbackService.error(this.authService.getErrorMessage(error));
        },
      });
  }

  onFilterChange(): void {
    this.loadResidents();
  }

  createResident(): void {
    if (!this.canManageResidents) {
      return;
    }

    void this.router.navigate(['/residents/new']);
  }

  openDetail(residentId: string): void {
    void this.router.navigate(['/residents', residentId]);
  }

  trackByResident(_index: number, resident: Resident): string {
    return resident.id;
  }

  statusLabel(active: boolean): string {
    return active ? 'Activo' : 'Inactivo';
  }

  statusColor(active: boolean): 'success' | 'medium' {
    return active ? 'success' : 'medium';
  }
}
