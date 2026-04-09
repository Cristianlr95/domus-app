import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { FeedbackService } from '../../../../core/services/feedback.service';
import { AuditAction, AuditLogItem } from '../../models/audit.models';
import { AuditApiService } from '../../services/audit-api.service';

@Component({
  selector: 'app-audit-list-page',
  templateUrl: './audit-list.page.html',
  styleUrls: ['./audit-list.page.scss'],
  standalone: false,
})
export class AuditListPage {
  private readonly auditApiService = inject(AuditApiService);
  private readonly feedbackService = inject(FeedbackService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly actions: AuditAction[] = [
    'CREATE',
    'UPDATE',
    'STATUS_CHANGE',
    'LOGIN',
    'DELIVERY',
    'VISIT_CHECKIN',
    'VISIT_CHECKOUT',
    'MESSAGE_SENT',
  ];

  auditLogs: AuditLogItem[] = [];
  loading = false;
  selectedEntityType = '';
  selectedAction: AuditAction | '' = '';
  search = '';

  ionViewWillEnter(): void {
    this.loadAuditLogs();
  }

  refresh(): void {
    this.loadAuditLogs();
  }

  onFilterChange(): void {
    this.loadAuditLogs();
  }

  openDetail(auditLogId: string): void {
    void this.router.navigate(['/audit', auditLogId]);
  }

  trackByAuditLog(_index: number, auditLog: AuditLogItem): string {
    return auditLog.id;
  }

  private loadAuditLogs(): void {
    this.loading = true;
    this.auditApiService.list({
      entityType: this.selectedEntityType || undefined,
      action: this.selectedAction,
      search: this.search,
    })
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: (auditLogs) => {
          this.auditLogs = auditLogs;
        },
        error: async (error) => {
          await this.feedbackService.error(this.authService.getErrorMessage(error));
        },
      });
  }
}
