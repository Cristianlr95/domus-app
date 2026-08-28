import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/api/api.models';
import {
  CreatePackageRequest,
  DeliverPackageRequest,
  CustodyDeliveryRequest,
  CreatePackageReceptionRequest,
  CreatePackagePickupCodeRequest,
  PackagePickupCode,
  PackageMetrics,
  PackagePickupAuthorization,
  PackageIncident,
  CreatePackageIncidentRequest,
  PackageCustodyEvent,
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
  private readonly operationsUrl = `${environment.apiBaseUrl}/operations/packages`;

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

  deliverFromCustody(payload: CustodyDeliveryRequest): Observable<Record<string, unknown>> {
    return this.http
      .post<ApiResponse<Record<string, unknown>>>(`${this.operationsUrl}/deliveries`, payload)
      .pipe(map((response) => response.data));
  }

  createReception(payload: CreatePackageReceptionRequest): Observable<Record<string, unknown>> {
    return this.http
      .post<ApiResponse<Record<string, unknown>>>(`${this.operationsUrl}/receptions`, payload)
      .pipe(map((response) => response.data));
  }

  listCustodyEvents(id: string): Observable<PackageCustodyEvent[]> {
    return this.http
      .get<ApiResponse<PackageCustodyEvent[]>>(`${this.operationsUrl}/${id}/custody-events`)
      .pipe(map((response) => response.data));
  }

  createPickupCode(payload: CreatePackagePickupCodeRequest): Observable<PackagePickupCode> {
    return this.http
      .post<ApiResponse<PackagePickupCode>>(`${this.operationsUrl}/pickup-codes`, payload)
      .pipe(map((response) => response.data));
  }

  getMetrics(): Observable<PackageMetrics> {
    return this.http
      .get<ApiResponse<PackageMetrics>>(`${this.operationsUrl}/metrics`)
      .pipe(map((response) => response.data));
  }

  listPickupAuthorizations(): Observable<PackagePickupAuthorization[]> {
    return this.http
      .get<ApiResponse<PackagePickupAuthorization[]>>(`${this.operationsUrl}/pickup-authorizations`)
      .pipe(map((response) => response.data));
  }

  revokePickupAuthorization(id: string): Observable<Record<string, unknown>> {
    return this.http
      .patch<ApiResponse<Record<string, unknown>>>(`${this.operationsUrl}/pickup-authorizations/${id}/revoke`, {})
      .pipe(map((response) => response.data));
  }

  listIncidents(id: string): Observable<PackageIncident[]> {
    return this.http
      .get<ApiResponse<PackageIncident[]>>(`${this.operationsUrl}/${id}/incidents`)
      .pipe(map((response) => response.data));
  }

  createIncident(payload: CreatePackageIncidentRequest): Observable<Record<string, unknown>> {
    return this.http
      .post<ApiResponse<Record<string, unknown>>>(`${this.operationsUrl}/incidents`, payload)
      .pipe(map((response) => response.data));
  }

  resolveIncident(id: string, resolution: string): Observable<Record<string, unknown>> {
    return this.http
      .patch<ApiResponse<Record<string, unknown>>>(`${this.operationsUrl}/incidents/${id}/resolve`, { resolution })
      .pipe(map((response) => response.data));
  }
}
