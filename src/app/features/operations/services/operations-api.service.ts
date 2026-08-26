import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/api/api.models';
import { OperationsRow, OperationsSummary } from '../models/operations.models';

@Injectable({ providedIn: 'root' })
export class OperationsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/operations`;

  summary(): Observable<OperationsSummary> {
    return this.http
      .get<ApiResponse<OperationsSummary>>(`${this.baseUrl}/summary`)
      .pipe(map((response) => response.data));
  }

  list(resource: string): Observable<OperationsRow[]> {
    return this.http
      .get<ApiResponse<OperationsRow[]>>(`${this.baseUrl}/${resource}`)
      .pipe(map((response) => response.data));
  }

  execute(
    method: 'POST' | 'PATCH',
    path: string,
    payload: Record<string, unknown>,
  ): Observable<unknown> {
    return this.http
      .request<ApiResponse<unknown>>(method, `${this.baseUrl}${path}`, {
        body: payload,
      })
      .pipe(map((response) => response.data));
  }
}
