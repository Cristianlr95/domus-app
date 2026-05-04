import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/api/api.models';
import {
  CreatePropertyRequest,
  Property,
  PropertyFilter,
  UpdatePropertyRequest,
} from '../models/property.models';

@Injectable({
  providedIn: 'root',
})
export class PropertiesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/properties`;

  list(filter?: PropertyFilter): Observable<Property[]> {
    let params = new HttpParams();

    if (filter?.type) {
      params = params.set('type', filter.type);
    }

    if (filter?.status) {
      params = params.set('status', filter.status);
    }

    if (filter?.block) {
      params = params.set('block', filter.block);
    }

    if (filter?.search?.trim()) {
      params = params.set('search', filter.search.trim());
    }

    return this.http
      .get<ApiResponse<Property[]>>(this.baseUrl, { params })
      .pipe(map((response) => response.data));
  }

  getById(id: string): Observable<Property> {
    return this.http
      .get<ApiResponse<Property>>(`${this.baseUrl}/${id}`)
      .pipe(map((response) => response.data));
  }

  create(payload: CreatePropertyRequest): Observable<Property> {
    return this.http
      .post<ApiResponse<Property>>(this.baseUrl, payload)
      .pipe(map((response) => response.data));
  }

  update(id: string, payload: UpdatePropertyRequest): Observable<Property> {
    return this.http
      .put<ApiResponse<Property>>(`${this.baseUrl}/${id}`, payload)
      .pipe(map((response) => response.data));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
