import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/api/api.models';
import { CreateVisitRequest, UpdateVisitStatusRequest, Visit, VisitStatus } from '../models/visit.models';

@Injectable({
  providedIn: 'root',
})
export class VisitsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/visits`;

  list(status?: VisitStatus | '', search?: string): Observable<Visit[]> {
    let params = new HttpParams();

    if (status) {
      params = params.set('status', status);
    }

    if (search?.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http
      .get<ApiResponse<Visit[]>>(this.baseUrl, { params })
      .pipe(map((response) => response.data));
  }

  getById(id: string): Observable<Visit> {
    return this.http
      .get<ApiResponse<Visit>>(`${this.baseUrl}/${id}`)
      .pipe(map((response) => response.data));
  }

  create(payload: CreateVisitRequest): Observable<Visit> {
    return this.http
      .post<ApiResponse<Visit>>(this.baseUrl, payload)
      .pipe(map((response) => response.data));
  }

  updateStatus(id: string, payload: UpdateVisitStatusRequest): Observable<Visit> {
    return this.http
      .patch<ApiResponse<Visit>>(`${this.baseUrl}/${id}/status`, payload)
      .pipe(map((response) => response.data));
  }
}
