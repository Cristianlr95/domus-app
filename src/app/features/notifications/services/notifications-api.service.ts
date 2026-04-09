import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/api/api.models';
import { NotificationItem, NotificationUnreadCount } from '../models/notification.models';

@Injectable({
  providedIn: 'root',
})
export class NotificationsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/notifications`;

  readonly unreadCount = signal(0);

  list(unreadOnly = false): Observable<NotificationItem[]> {
    let params = new HttpParams();
    if (unreadOnly) {
      params = params.set('unreadOnly', 'true');
    }

    return this.http
      .get<ApiResponse<NotificationItem[]>>(this.baseUrl, { params })
      .pipe(map((response) => response.data));
  }

  markAsRead(id: string): Observable<NotificationItem> {
    return this.http
      .patch<ApiResponse<NotificationItem>>(`${this.baseUrl}/${id}/read`, {})
      .pipe(map((response) => response.data));
  }

  loadUnreadCount(): Observable<NotificationUnreadCount> {
    return this.http
      .get<ApiResponse<NotificationUnreadCount>>(`${this.baseUrl}/unread-count`)
      .pipe(
        map((response) => response.data),
        tap((summary) => {
          this.unreadCount.set(summary.unreadCount);
        }),
      );
  }

  clearUnreadCount(): void {
    this.unreadCount.set(0);
  }
}
