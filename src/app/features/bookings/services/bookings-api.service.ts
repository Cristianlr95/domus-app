import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/api/api.models';
import {
  Booking,
  BookingFilter,
  CommonSpace,
  CreateBookingRequest,
  UpdateBookingStatusRequest,
} from '../models/booking.models';

@Injectable({
  providedIn: 'root',
})
export class BookingsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/bookings`;

  listSpaces(): Observable<CommonSpace[]> {
    return this.http
      .get<ApiResponse<CommonSpace[]>>(`${this.baseUrl}/spaces`)
      .pipe(map((response) => response.data));
  }

  list(filter?: BookingFilter): Observable<Booking[]> {
    let params = new HttpParams();

    if (filter?.status) {
      params = params.set('status', filter.status);
    }

    if (filter?.spaceType) {
      params = params.set('spaceType', filter.spaceType);
    }

    if (filter?.startDate) {
      params = params.set('startDate', filter.startDate);
    }

    if (filter?.endDate) {
      params = params.set('endDate', filter.endDate);
    }

    if (filter?.search?.trim()) {
      params = params.set('search', filter.search.trim());
    }

    return this.http
      .get<ApiResponse<Booking[]>>(this.baseUrl, { params })
      .pipe(map((response) => response.data));
  }

  getById(id: string): Observable<Booking> {
    return this.http
      .get<ApiResponse<Booking>>(`${this.baseUrl}/${id}`)
      .pipe(map((response) => response.data));
  }

  create(payload: CreateBookingRequest): Observable<Booking> {
    return this.http
      .post<ApiResponse<Booking>>(this.baseUrl, payload)
      .pipe(map((response) => response.data));
  }

  updateStatus(
    id: string,
    payload: UpdateBookingStatusRequest,
  ): Observable<Booking> {
    return this.http
      .patch<ApiResponse<Booking>>(`${this.baseUrl}/${id}/status`, payload)
      .pipe(map((response) => response.data));
  }

  cancel(id: string): Observable<Booking> {
    return this.http
      .patch<ApiResponse<Booking>>(`${this.baseUrl}/${id}/cancel`, {})
      .pipe(map((response) => response.data));
  }
}
