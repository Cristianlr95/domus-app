import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { FeedbackService } from '../../../../core/services/feedback.service';
import { NotificationItem, NotificationType } from '../../models/notification.models';
import { NotificationsApiService } from '../../services/notifications-api.service';

@Component({
  selector: 'app-notifications-list-page',
  templateUrl: './notifications-list.page.html',
  styleUrls: ['./notifications-list.page.scss'],
  standalone: false,
})
export class NotificationsListPage {
  private readonly notificationsApiService = inject(NotificationsApiService);
  private readonly feedbackService = inject(FeedbackService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  notifications: NotificationItem[] = [];
  loading = false;

  ionViewWillEnter(): void {
    this.loadNotifications();
  }

  refresh(): void {
    this.loadNotifications();
  }

  async openNotification(notification: NotificationItem): Promise<void> {
    try {
      if (!notification.read) {
        const updated = await firstValueFrom(this.notificationsApiService.markAsRead(notification.id));
        if (updated) {
          this.notifications = this.notifications.map((item) => item.id === updated.id ? updated : item);
          this.refreshUnreadCount();
        }
      }

      if (notification.route) {
        await this.router.navigate([notification.route]);
      }
    } catch (error) {
      await this.feedbackService.error(this.authService.getErrorMessage(error));
    }
  }

  typeLabel(type: NotificationType): string {
    switch (type) {
      case 'PACKAGE_RECEIVED':
        return 'Encomienda';
      case 'VISIT_REGISTERED':
        return 'Visita';
      case 'MESSAGE_RECEIVED':
        return 'Mensaje';
      case 'SYSTEM_EVENT':
        return 'Sistema';
    }
  }

  typeColor(type: NotificationType): 'primary' | 'warning' | 'tertiary' | 'medium' {
    switch (type) {
      case 'PACKAGE_RECEIVED':
        return 'warning';
      case 'VISIT_REGISTERED':
        return 'primary';
      case 'MESSAGE_RECEIVED':
        return 'tertiary';
      case 'SYSTEM_EVENT':
        return 'medium';
    }
  }

  trackByNotification(_index: number, notification: NotificationItem): string {
    return notification.id;
  }

  private loadNotifications(): void {
    this.loading = true;
    this.notificationsApiService.list()
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: (notifications) => {
          this.notifications = notifications;
          this.refreshUnreadCount();
        },
        error: async (error) => {
          await this.feedbackService.error(this.authService.getErrorMessage(error));
        },
      });
  }

  private refreshUnreadCount(): void {
    this.notificationsApiService.loadUnreadCount().subscribe();
  }
}
