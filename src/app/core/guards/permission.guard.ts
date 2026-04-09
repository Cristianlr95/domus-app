import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { map, Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { PermissionCode } from '../auth/auth.models';

@Injectable({
  providedIn: 'root',
})
export class PermissionGuard implements CanActivate {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> {
    const requiredPermissions = (route.data['permissions'] as PermissionCode[] | undefined) ?? [];
    const requireAll = (route.data['requireAllPermissions'] as boolean | undefined) ?? false;

    return this.authService.ensureAuthenticated().pipe(
      map((result) => {
        if (result !== true) {
          return result;
        }

        if (requiredPermissions.length === 0) {
          return true;
        }

        const allowed = requireAll
          ? this.authService.hasAllPermissions(requiredPermissions)
          : this.authService.hasAnyPermission(requiredPermissions);

        return allowed ? true : this.router.createUrlTree(['/dashboard']);
      }),
    );
  }
}
