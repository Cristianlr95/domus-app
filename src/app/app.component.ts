import { Component, inject, OnInit } from '@angular/core';
import { PERMISSIONS } from './core/auth/auth.models';
import { AuthService } from './core/auth/auth.service';
import { NotificationsApiService } from './features/notifications/services/notifications-api.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly notificationsApiService = inject(NotificationsApiService);

  ngOnInit(): void {
    this.authService.restoreSession().subscribe({
      next: (user) => {
        if (user) {
          if (user.permissions.includes(PERMISSIONS.NOTIFICATIONS_READ)) {
            this.notificationsApiService.loadUnreadCount().subscribe();
            return;
          }

          this.notificationsApiService.clearUnreadCount();
          return;
        }

        this.notificationsApiService.clearUnreadCount();
      },
    });
  }
}
