import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, UrlTree } from '@angular/router';
import { catchError, finalize, map, Observable, of, tap } from 'rxjs';
import { ApiErrorResponse, ApiResponse } from '../api/api.models';
import { environment } from '../../../environments/environment';
import { AuthResponse, AuthUser, LoginRequest, PermissionCode, UserRole } from './auth.models';
import { SessionStorageService } from '../storage/session-storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly sessionStorage = inject(SessionStorageService);

  readonly currentUser = signal<AuthUser | null>(null);
  readonly loading = signal(false);

  login(payload: LoginRequest): Observable<AuthResponse> {
    this.loading.set(true);

    return this.http
      .post<ApiResponse<AuthResponse>>(`${environment.apiBaseUrl}/auth/login`, payload)
      .pipe(
        map((response) => response.data),
        tap((response) => {
          this.sessionStorage.setAccessToken(response.accessToken);
          this.currentUser.set(response.user);
        }),
        finalize(() => this.loading.set(false)),
      );
  }

  restoreSession(): Observable<AuthUser | null> {
    const token = this.sessionStorage.getAccessToken();

    if (!token) {
      this.currentUser.set(null);
      return of(null);
    }

    if (this.currentUser()) {
      return of(this.currentUser());
    }

    this.loading.set(true);

    return this.fetchCurrentUser().pipe(
      tap((user) => this.currentUser.set(user)),
      catchError(() => {
        this.clearSession(false);
        return of(null);
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  ensureAuthenticated(): Observable<boolean | UrlTree> {
    if (this.currentUser()) {
      return of(true);
    }

    if (!this.sessionStorage.getAccessToken()) {
      return of(this.router.createUrlTree(['/login']));
    }

    return this.restoreSession().pipe(
      map((user) => user ? true : this.router.createUrlTree(['/login'])),
    );
  }

  ensureGuest(): Observable<boolean | UrlTree> {
    if (this.currentUser() || this.sessionStorage.getAccessToken()) {
      return this.restoreSession().pipe(
        map((user) => user ? this.router.createUrlTree(['/dashboard']) : true),
      );
    }

    return of(true);
  }

  fetchCurrentUser(): Observable<AuthUser> {
    return this.http
      .get<ApiResponse<AuthUser>>(`${environment.apiBaseUrl}/users/me`)
      .pipe(map((response) => response.data));
  }

  logout(): void {
    this.clearSession(true);
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const user = this.currentUser();
    return !!user && roles.some((role) => user.roles.includes(role));
  }

  hasPermission(permission: PermissionCode): boolean {
    const user = this.currentUser();
    return !!user && user.permissions.includes(permission);
  }

  hasAnyPermission(permissions: PermissionCode[]): boolean {
    const user = this.currentUser();
    return !!user && permissions.some((permission) => user.permissions.includes(permission));
  }

  hasAllPermissions(permissions: PermissionCode[]): boolean {
    const user = this.currentUser();
    return !!user && permissions.every((permission) => user.permissions.includes(permission));
  }

  getErrorMessage(error: unknown): string {
    const apiError = (error as { error?: ApiErrorResponse })?.error;
    return apiError?.message ?? 'No pudimos completar la operación. Inténtalo nuevamente.';
  }

  private clearSession(redirect: boolean): void {
    this.sessionStorage.clearSession();
    this.currentUser.set(null);

    if (redirect) {
      void this.router.navigate(['/login']);
    }
  }
}
