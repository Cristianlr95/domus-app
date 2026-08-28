import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/api/api.models';
import { LaundryMachine, LaundryMetrics, LaundryUsage } from '../models/laundry.models';

@Injectable({ providedIn: 'root' })
export class LaundryApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/operations/laundry`;

  machines(): Observable<LaundryMachine[]> { return this.http.get<ApiResponse<LaundryMachine[]>>(`${this.baseUrl}/machines`).pipe(map((response) => response.data)); }
  usages(): Observable<LaundryUsage[]> { return this.http.get<ApiResponse<LaundryUsage[]>>(`${this.baseUrl}/usages`).pipe(map((response) => response.data)); }
  metrics(): Observable<LaundryMetrics> { return this.http.get<ApiResponse<LaundryMetrics>>(`${this.baseUrl}/metrics`).pipe(map((response) => response.data)); }
  request(machineId: string, scheduledStart: string, scheduledEnd: string): Observable<unknown> { return this.http.post<ApiResponse<unknown>>(`${this.baseUrl}/usages`, { machineId, scheduledStart, scheduledEnd, tokensDelivered: 0 }).pipe(map((response) => response.data)); }
  transition(id: string, status: string, notes?: string): Observable<unknown> { return this.http.patch<ApiResponse<unknown>>(`${this.baseUrl}/usages/${id}/status`, { status, notes: notes || null }).pipe(map((response) => response.data)); }
}
