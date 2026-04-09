import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/api/api.models';
import { ConciergeDashboard, ConciergeRecentActivity } from '../models/concierge-dashboard.models';

@Injectable({
  providedIn: 'root',
})
export class ConciergeApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/concierge`;

  getDashboard(): Observable<ConciergeDashboard> {
    return this.http
      .get<ApiResponse<ConciergeDashboard>>(`${this.baseUrl}/dashboard`)
      .pipe(map((response) => response.data));
  }

  getRecentActivity(limit = 8): Observable<ConciergeRecentActivity[]> {
    return this.http
      .get<ApiResponse<ConciergeRecentActivity[]>>(`${this.baseUrl}/recent-activity`, {
        params: { limit },
      })
      .pipe(map((response) => response.data));
  }
}
