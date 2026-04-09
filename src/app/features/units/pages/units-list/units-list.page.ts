import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
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
  private readonly router = inject(Router);

  units: Unit[] = [];
  loading = false;
  selectedActive: boolean | '' = '';
  search = '';

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
    void this.router.navigate(['/units/new']);
  }

  openDetail(unitId: string): void {
    void this.router.navigate(['/units', unitId]);
  }

  trackByUnit(_index: number, unit: Unit): string {
    return unit.id;
  }
}
