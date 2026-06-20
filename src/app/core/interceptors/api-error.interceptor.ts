import { inject, Injectable, Injector } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { finalize, Observable, shareReplay, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthResponse } from '../auth/auth.models';
import { AuthService } from '../auth/auth.service';
import { SessionStorageService } from '../storage/session-storage.service';

@Injectable()
export class ApiErrorInterceptor implements HttpInterceptor {
  private readonly injector = inject(Injector);
  private readonly sessionStorage = inject(SessionStorageService);
  private refreshInFlight$?: Observable<AuthResponse>;

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        const isAuthEndpoint = req.url.includes('/auth/login')
          || req.url.includes('/auth/refresh')
          || req.url.includes('/auth/logout');

        if (error.status === 401 && !isAuthEndpoint && this.sessionStorage.getRefreshToken()) {
          return this.refreshSessionOnce().pipe(
            switchMap(() => {
              const token = this.sessionStorage.getAccessToken();
              return next.handle(token
                ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
                : req);
            }),
          );
        }

        if (error.status === 401 && !isAuthEndpoint) {
          this.injector.get(AuthService).logout();
        }

        return throwError(() => error);
      }),
    );
  }

  private refreshSessionOnce(): Observable<AuthResponse> {
    if (!this.refreshInFlight$) {
      const authService = this.injector.get(AuthService);
      this.refreshInFlight$ = authService.refreshSession().pipe(
        catchError((error) => {
          authService.logout();
          return throwError(() => error);
        }),
        finalize(() => {
          this.refreshInFlight$ = undefined;
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    }

    return this.refreshInFlight$;
  }
}
