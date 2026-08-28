import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/api/api.models';

export interface AccessInvitationDto {
  id: string;
  visitor_name: string;
  visitor_document: string | null;
  block_label: string;
  unit_code: string;
  valid_until: string;
  uses_count: number;
  max_uses: number;
  status: string;
}

export interface AccessAuthorizationRequestDto {
  id: string;
  visitor_alias: string;
  visitor_document: string | null;
  status: string;
  valid_until: string;
  decision_notes?: string;
  unit_code: string;
  block_label: string;
}

@Injectable({ providedIn: 'root' })
export class AccessApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/operations/access`;
  units(): Observable<Record<string, unknown>[]> { return this.http.get<ApiResponse<Record<string, unknown>[]>>(`${this.base}/units`).pipe(map(r => r.data)); }
  invitations(): Observable<AccessInvitationDto[]> { return this.http.get<ApiResponse<AccessInvitationDto[]>>(`${this.base}/invitations`).pipe(map(r => r.data)); }
  invite(payload: Record<string, unknown>): Observable<Record<string, unknown>> { return this.http.post<ApiResponse<Record<string, unknown>>>(`${this.base}/invitations`, payload).pipe(map(r => r.data)); }
  event(id: string, eventType: string, source: string): Observable<Record<string, unknown>> { return this.http.post<ApiResponse<Record<string, unknown>>>(`${this.base}/invitations/${id}/events`, { eventType, source }).pipe(map(r => r.data)); }
  tokenEvent(token: string): Observable<Record<string, unknown>> { return this.http.post<ApiResponse<Record<string, unknown>>>(`${this.base}/token/events`, { token, eventType: 'CHECKED_IN', source: 'QR' }).pipe(map(r => r.data)); }
  authorizationRequests(): Observable<AccessAuthorizationRequestDto[]> { return this.http.get<ApiResponse<AccessAuthorizationRequestDto[]>>(`${this.base}/authorization-requests`).pipe(map(r => r.data)); }
  requestAuthorization(payload: Record<string, unknown>): Observable<Record<string, unknown>> { return this.http.post<ApiResponse<Record<string, unknown>>>(`${this.base}/authorization-requests`, payload).pipe(map(r => r.data)); }
  decideAuthorization(id: string, decision: 'APPROVED' | 'REJECTED'): Observable<Record<string, unknown>> { return this.http.post<ApiResponse<Record<string, unknown>>>(`${this.base}/authorization-requests/${id}/decision`, { decision }).pipe(map(r => r.data)); }
  recurringRule(payload: Record<string, unknown>): Observable<Record<string, unknown>> { return this.http.post<ApiResponse<Record<string, unknown>>>(`${this.base}/recurring-rules`, payload).pipe(map(r => r.data)); }
  privacy(): Observable<Record<string, unknown>> { return this.http.get<ApiResponse<Record<string, unknown>>>(`${this.base}/privacy`).pipe(map(r => r.data)); }
  savePrivacy(payload: Record<string, unknown>): Observable<Record<string, unknown>> { return this.http.post<ApiResponse<Record<string, unknown>>>(`${this.base}/privacy`, payload).pipe(map(r => r.data)); }
  savePolicy(condominiumId: string, payload: Record<string, unknown>): Observable<Record<string, unknown>> { return this.http.post<ApiResponse<Record<string, unknown>>>(`${this.base}/policies/${condominiumId}`, payload).pipe(map(r => r.data)); }
}
