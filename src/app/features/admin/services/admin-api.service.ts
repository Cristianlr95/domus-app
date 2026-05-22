import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/api/api.models';
import { AdminDashboard, AdminRecentActivity } from '../models/admin-dashboard.models';

@Injectable({
  providedIn: 'root',
})
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/admin`;

  getDashboard(): Observable<AdminDashboard> {
    return this.http
      .get<ApiResponse<AdminDashboard>>(`${this.baseUrl}/dashboard`)
      .pipe(map((response) => response.data));
  }

  getRecentActivity(limit = 8): Observable<AdminRecentActivity[]> {
    return this.http
      .get<ApiResponse<AdminRecentActivity[]>>(`${this.baseUrl}/recent-activity`, {
        params: { limit },
      })
      .pipe(map((response) => response.data));
  }
}
