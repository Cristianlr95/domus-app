import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/api/api.models';
import {
  CreateParkingRequest,
  ParkingOccupancyStatus,
  ParkingSpot,
  ParkingType,
  UpdateParkingRequest,
  UpdateParkingStatusRequest,
} from '../models/parking.models';

@Injectable({
  providedIn: 'root',
})
export class ParkingApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/parking`;

  list(
    active?: boolean | '',
    occupancyStatus?: ParkingOccupancyStatus | '',
    parkingType?: ParkingType | '',
    search?: string,
  ): Observable<ParkingSpot[]> {
    let params = new HttpParams();

    if (active !== '') {
      params = params.set('active', String(active));
    }

    if (occupancyStatus) {
      params = params.set('occupancyStatus', occupancyStatus);
    }

    if (parkingType) {
      params = params.set('parkingType', parkingType);
    }

    if (search?.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http
      .get<ApiResponse<ParkingSpot[]>>(this.baseUrl, { params })
      .pipe(map((response) => response.data));
  }

  getById(id: string): Observable<ParkingSpot> {
    return this.http
      .get<ApiResponse<ParkingSpot>>(`${this.baseUrl}/${id}`)
      .pipe(map((response) => response.data));
  }

  create(payload: CreateParkingRequest): Observable<ParkingSpot> {
    return this.http
      .post<ApiResponse<ParkingSpot>>(this.baseUrl, payload)
      .pipe(map((response) => response.data));
  }

  update(id: string, payload: UpdateParkingRequest): Observable<ParkingSpot> {
    return this.http
      .put<ApiResponse<ParkingSpot>>(`${this.baseUrl}/${id}`, payload)
      .pipe(map((response) => response.data));
  }

  updateStatus(id: string, payload: UpdateParkingStatusRequest): Observable<ParkingSpot> {
    return this.http
      .patch<ApiResponse<ParkingSpot>>(`${this.baseUrl}/${id}/status`, payload)
      .pipe(map((response) => response.data));
  }
}
