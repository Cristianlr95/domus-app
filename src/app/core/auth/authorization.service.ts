import { inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { PermissionCode, UserRole } from './auth.models';

@Injectable({
  providedIn: 'root',
})
export class AuthorizationService {
  private readonly authService = inject(AuthService);

  hasRole(role: UserRole): boolean {
    return this.authService.hasAnyRole([role]);
  }

  hasAnyRole(roles: UserRole[]): boolean {
    return this.authService.hasAnyRole(roles);
  }

  hasPermission(permission: PermissionCode): boolean {
    return this.authService.hasPermission(permission);
  }

  hasAnyPermission(permissions: PermissionCode[]): boolean {
    return this.authService.hasAnyPermission(permissions);
  }

  hasAllPermissions(permissions: PermissionCode[]): boolean {
    return this.authService.hasAllPermissions(permissions);
  }
}
