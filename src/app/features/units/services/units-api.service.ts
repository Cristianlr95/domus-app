import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/api/api.models';
import { CreateUnitRequest, Unit, UpdateUnitRequest, UpdateUnitStatusRequest } from '../models/unit.models';

@Injectable({
  providedIn: 'root',
})
export class UnitsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/units`;

  list(active?: boolean | '', search?: string): Observable<Unit[]> {
    let params = new HttpParams();

    if (active !== '') {
      params = params.set('active', String(active));
    }

    if (search?.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http
      .get<ApiResponse<Unit[]>>(this.baseUrl, { params })
      .pipe(map((response) => response.data));
  }

  getById(id: string): Observable<Unit> {
    return this.http
      .get<ApiResponse<Unit>>(`${this.baseUrl}/${id}`)
      .pipe(map((response) => response.data));
  }

  create(payload: CreateUnitRequest): Observable<Unit> {
    return this.http
      .post<ApiResponse<Unit>>(this.baseUrl, payload)
      .pipe(map((response) => response.data));
  }

  update(id: string, payload: UpdateUnitRequest): Observable<Unit> {
    return this.http
      .put<ApiResponse<Unit>>(`${this.baseUrl}/${id}`, payload)
      .pipe(map((response) => response.data));
  }

  updateStatus(id: string, payload: UpdateUnitStatusRequest): Observable<Unit> {
    return this.http
      .patch<ApiResponse<Unit>>(`${this.baseUrl}/${id}/status`, payload)
      .pipe(map((response) => response.data));
  }
}
