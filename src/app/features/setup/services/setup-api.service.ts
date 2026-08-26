import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/api/api.models';
import { SetupBatchResult, SetupCondominium, SetupUnitSpec } from '../models/setup.models';

@Injectable({ providedIn: 'root' })
export class SetupApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/operations`;

  listCondominiums(): Observable<SetupCondominium[]> {
    return this.http.get<ApiResponse<SetupCondominium[]>>(`${this.baseUrl}/condominiums`).pipe(map((response) => response.data));
  }

  listSections(): Observable<Record<string, unknown>[]> {
    return this.http.get<ApiResponse<Record<string, unknown>[]>>(`${this.baseUrl}/building-sections`).pipe(map((response) => response.data));
  }

  createCondominium(payload: { name: string; address: string }): Observable<SetupBatchResult> {
    return this.http.post<ApiResponse<SetupBatchResult>>(`${this.baseUrl}/setup/condominiums`, payload).pipe(map((response) => response.data));
  }

  createSection(condominiumId: string, payload: { code: string; name: string; type: string }): Observable<SetupBatchResult> {
    return this.http.post<ApiResponse<SetupBatchResult>>(`${this.baseUrl}/setup/condominiums/${condominiumId}/sections`, payload).pipe(map((response) => response.data));
  }

  preview(condominiumId: string, sourceName: string, units: SetupUnitSpec[]): Observable<SetupBatchResult> {
    return this.http.post<ApiResponse<SetupBatchResult>>(`${this.baseUrl}/setup/preview`, {
      condominiumId, batchType: 'STRUCTURE_BUILDER', sourceName, units,
    }).pipe(map((response) => response.data));
  }

  commit(batchId: string): Observable<SetupBatchResult> {
    return this.http.post<ApiResponse<SetupBatchResult>>(`${this.baseUrl}/setup/${batchId}/commit`, {}).pipe(map((response) => response.data));
  }
}
