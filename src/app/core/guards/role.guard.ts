import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { map, Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { UserRole } from '../auth/auth.models';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> {
    const requiredRoles = (route.data['roles'] as UserRole[] | undefined) ?? [];

    return this.authService.ensureAuthenticated().pipe(
      map((result) => {
        if (result !== true) {
          return result;
        }

        if (requiredRoles.length === 0 || this.authService.hasAnyRole(requiredRoles)) {
          return true;
        }

        return this.router.createUrlTree(['/dashboard']);
      }),
    );
  }
}
