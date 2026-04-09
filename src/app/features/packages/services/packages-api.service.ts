import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/api/api.models';
import {
  CreatePackageRequest,
  DeliverPackageRequest,
  PackageItem,
  PackageStatus,
  UpdatePackageStatusRequest,
} from '../models/package.models';

@Injectable({
  providedIn: 'root',
})
export class PackagesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/packages`;

  list(status?: PackageStatus | '', search?: string): Observable<PackageItem[]> {
    let params = new HttpParams();

    if (status) {
      params = params.set('status', status);
    }

    if (search?.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http
      .get<ApiResponse<PackageItem[]>>(this.baseUrl, { params })
      .pipe(map((response) => response.data));
  }

  getById(id: string): Observable<PackageItem> {
    return this.http
      .get<ApiResponse<PackageItem>>(`${this.baseUrl}/${id}`)
      .pipe(map((response) => response.data));
  }

  create(payload: CreatePackageRequest): Observable<PackageItem> {
    return this.http
      .post<ApiResponse<PackageItem>>(this.baseUrl, payload)
      .pipe(map((response) => response.data));
  }

  updateStatus(id: string, payload: UpdatePackageStatusRequest): Observable<PackageItem> {
    return this.http
      .patch<ApiResponse<PackageItem>>(`${this.baseUrl}/${id}/status`, payload)
      .pipe(map((response) => response.data));
  }

  deliver(id: string, payload: DeliverPackageRequest): Observable<PackageItem> {
    return this.http
      .patch<ApiResponse<PackageItem>>(`${this.baseUrl}/${id}/deliver`, payload)
      .pipe(map((response) => response.data));
  }
}
