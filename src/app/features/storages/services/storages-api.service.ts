import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/api/api.models';
import {
  CreateStorageRequest,
  StorageItem,
  StorageOccupancyStatus,
  UpdateStorageRequest,
  UpdateStorageStatusRequest,
} from '../models/storage.models';

@Injectable({
  providedIn: 'root',
})
export class StoragesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/storages`;

  list(active?: boolean | '', occupancyStatus?: StorageOccupancyStatus | '', unitId?: string | '', search?: string): Observable<StorageItem[]> {
    let params = new HttpParams();

    if (active !== '') {
      params = params.set('active', String(active));
    }

    if (occupancyStatus) {
      params = params.set('occupancyStatus', occupancyStatus);
    }

    if (unitId) {
      params = params.set('unitId', unitId);
    }

    if (search?.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http
      .get<ApiResponse<StorageItem[]>>(this.baseUrl, { params })
      .pipe(map((response) => response.data));
  }

  getById(id: string): Observable<StorageItem> {
    return this.http
      .get<ApiResponse<StorageItem>>(`${this.baseUrl}/${id}`)
      .pipe(map((response) => response.data));
  }

  create(payload: CreateStorageRequest): Observable<StorageItem> {
    return this.http
      .post<ApiResponse<StorageItem>>(this.baseUrl, payload)
      .pipe(map((response) => response.data));
  }

  update(id: string, payload: UpdateStorageRequest): Observable<StorageItem> {
    return this.http
      .put<ApiResponse<StorageItem>>(`${this.baseUrl}/${id}`, payload)
      .pipe(map((response) => response.data));
  }

  updateStatus(id: string, payload: UpdateStorageStatusRequest): Observable<StorageItem> {
    return this.http
      .patch<ApiResponse<StorageItem>>(`${this.baseUrl}/${id}/status`, payload)
      .pipe(map((response) => response.data));
  }
}
