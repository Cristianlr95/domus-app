import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/api/api.models';
import { AuditFilters, AuditLogItem } from '../models/audit.models';

@Injectable({
  providedIn: 'root',
})
export class AuditApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/audit-logs`;

  list(filters: AuditFilters = {}): Observable<AuditLogItem[]> {
    let params = new HttpParams();

    if (filters.entityType) {
      params = params.set('entityType', filters.entityType);
    }

    if (filters.action) {
      params = params.set('action', filters.action);
    }

    if (filters.search?.trim()) {
      params = params.set('search', filters.search.trim());
    }

    return this.http
      .get<ApiResponse<AuditLogItem[]>>(this.baseUrl, { params })
      .pipe(map((response) => response.data));
  }

  getById(id: string): Observable<AuditLogItem> {
    return this.http
      .get<ApiResponse<AuditLogItem>>(`${this.baseUrl}/${id}`)
      .pipe(map((response) => response.data));
  }
}
