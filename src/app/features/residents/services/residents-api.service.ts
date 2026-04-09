import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/api/api.models';
import {
  CreateResidentRequest,
  Resident,
  ResidentLinkedUser,
  UpdateResidentRequest,
  UpdateResidentStatusRequest,
} from '../models/resident.models';

@Injectable({
  providedIn: 'root',
})
export class ResidentsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/residents`;

  list(active?: boolean | '', search?: string): Observable<Resident[]> {
    let params = new HttpParams();

    if (active !== '') {
      params = params.set('active', String(active));
    }

    if (search?.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http
      .get<ApiResponse<Resident[]>>(this.baseUrl, { params })
      .pipe(map((response) => response.data));
  }

  getById(id: string): Observable<Resident> {
    return this.http
      .get<ApiResponse<Resident>>(`${this.baseUrl}/${id}`)
      .pipe(map((response) => response.data));
  }

  create(payload: CreateResidentRequest): Observable<Resident> {
    return this.http
      .post<ApiResponse<Resident>>(this.baseUrl, payload)
      .pipe(map((response) => response.data));
  }

  update(id: string, payload: UpdateResidentRequest): Observable<Resident> {
    return this.http
      .put<ApiResponse<Resident>>(`${this.baseUrl}/${id}`, payload)
      .pipe(map((response) => response.data));
  }

  updateStatus(id: string, payload: UpdateResidentStatusRequest): Observable<Resident> {
    return this.http
      .patch<ApiResponse<Resident>>(`${this.baseUrl}/${id}/status`, payload)
      .pipe(map((response) => response.data));
  }

  listLinkableUsers(currentUserId?: string | null): Observable<ResidentLinkedUser[]> {
    let params = new HttpParams();

    if (currentUserId) {
      params = params.set('currentUserId', currentUserId);
    }

    return this.http
      .get<ApiResponse<ResidentLinkedUser[]>>(`${this.baseUrl}/linkable-users`, { params })
      .pipe(map((response) => response.data));
  }
}
