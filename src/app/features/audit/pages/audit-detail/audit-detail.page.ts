import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { FeedbackService } from '../../../../core/services/feedback.service';
import { AuditLogItem } from '../../models/audit.models';
import { AuditApiService } from '../../services/audit-api.service';

@Component({
  selector: 'app-audit-detail-page',
  templateUrl: './audit-detail.page.html',
  styleUrls: ['./audit-detail.page.scss'],
  standalone: false,
})
export class AuditDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly auditApiService = inject(AuditApiService);
  private readonly feedbackService = inject(FeedbackService);
  private readonly authService = inject(AuthService);

  auditLog: AuditLogItem | null = null;
  loading = false;

  ionViewWillEnter(): void {
    this.loadAuditLog();
  }

  prettyJson(value: string | null): string {
    if (!value) {
      return 'Sin datos';
    }

    return value;
  }

  private loadAuditLog(): void {
    const auditLogId = this.route.snapshot.paramMap.get('id');
    if (!auditLogId) {
      return;
    }

    this.loading = true;
    this.auditApiService.getById(auditLogId)
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: (auditLog) => {
          this.auditLog = auditLog;
        },
        error: async (error) => {
          await this.feedbackService.error(this.authService.getErrorMessage(error));
        },
      });
  }
}
