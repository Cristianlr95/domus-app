import { inject, Injectable, Injector } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { SessionStorageService } from '../storage/session-storage.service';

@Injectable()
export class ApiErrorInterceptor implements HttpInterceptor {
  private readonly injector = inject(Injector);
  private readonly sessionStorage = inject(SessionStorageService);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        const isAuthEndpoint = req.url.includes('/auth/login')
          || req.url.includes('/auth/refresh')
          || req.url.includes('/auth/logout');

        if (error.status === 401 && !isAuthEndpoint && this.sessionStorage.getRefreshToken()) {
          return this.injector.get(AuthService).refreshSession().pipe(
            switchMap(() => {
              const token = this.sessionStorage.getAccessToken();
              return next.handle(token
                ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
                : req);
            }),
            catchError((refreshError) => {
              this.injector.get(AuthService).logout();
              return throwError(() => refreshError);
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
}
