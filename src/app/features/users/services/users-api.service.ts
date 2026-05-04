import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/api/api.models';
import {
  CreateUserRequest,
  User,
  UserFilter,
  UpdateUserRequest,
} from '../models/user.models';

@Injectable({
  providedIn: 'root',
})
export class UsersApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/users`;

  list(filter?: UserFilter): Observable<User[]> {
    let params = new HttpParams();

    if (filter?.role) {
      params = params.set('role', filter.role);
    }

    if (filter?.active !== undefined) {
      params = params.set('active', filter.active.toString());
    }

    if (filter?.search?.trim()) {
      params = params.set('search', filter.search.trim());
    }

    return this.http
      .get<ApiResponse<User[]>>(this.baseUrl, { params })
      .pipe(map((response) => response.data));
  }

  getById(id: string): Observable<User> {
    return this.http
      .get<ApiResponse<User>>(`${this.baseUrl}/${id}`)
      .pipe(map((response) => response.data));
  }

  create(payload: CreateUserRequest): Observable<User> {
    return this.http
      .post<ApiResponse<User>>(this.baseUrl, payload)
      .pipe(map((response) => response.data));
  }

  update(id: string, payload: UpdateUserRequest): Observable<User> {
    return this.http
      .put<ApiResponse<User>>(`${this.baseUrl}/${id}`, payload)
      .pipe(map((response) => response.data));
  }

  deactivate(id: string): Observable<User> {
    return this.http
      .patch<ApiResponse<User>>(`${this.baseUrl}/${id}/deactivate`, {})
      .pipe(map((response) => response.data));
  }

  activate(id: string): Observable<User> {
    return this.http
      .patch<ApiResponse<User>>(`${this.baseUrl}/${id}/activate`, {})
      .pipe(map((response) => response.data));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
