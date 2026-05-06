import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { GuestGuard } from './core/guards/guest.guard';
import { PermissionGuard } from './core/guards/permission.guard';
import { PERMISSIONS } from './core/auth/auth.models';

const routes: Routes = [
  {
    path: 'login',
    canActivate: [GuestGuard],
    loadChildren: () => import('./features/auth/auth.module').then( m => m.AuthModule)
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/dashboard/dashboard.module').then( m => m.DashboardModule)
  },
  {
    path: 'visits',
    canActivate: [PermissionGuard],
    data: { permissions: [PERMISSIONS.VISITS_READ, PERMISSIONS.VISITS_CREATE, PERMISSIONS.VISITS_UPDATE] },
    loadChildren: () => import('./features/visits/visits.module').then( m => m.VisitsModule)
  },
  {
    path: 'concierge',
    canActivate: [PermissionGuard],
    data: { permissions: [PERMISSIONS.CONCIERGE_DASHBOARD_READ] },
    loadChildren: () => import('./features/concierge/concierge.module').then( m => m.ConciergeModule)
  },
  {
    path: 'packages',
    canActivate: [PermissionGuard],
    data: { permissions: [PERMISSIONS.PACKAGES_READ, PERMISSIONS.PACKAGES_CREATE, PERMISSIONS.PACKAGES_UPDATE] },
    loadChildren: () => import('./features/packages/packages.module').then( m => m.PackagesModule)
  },
  {
    path: 'residents',
    canActivate: [PermissionGuard],
    data: { permissions: [PERMISSIONS.RESIDENTS_READ, PERMISSIONS.RESIDENTS_MANAGE] },
    loadChildren: () => import('./features/residents/residents.module').then( m => m.ResidentsModule)
  },
  {
    path: 'units',
    canActivate: [PermissionGuard],
    data: { permissions: [PERMISSIONS.UNITS_READ, PERMISSIONS.UNITS_MANAGE] },
    loadChildren: () => import('./features/units/units.module').then( m => m.UnitsModule)
  },
  {
    path: 'parking',
    canActivate: [PermissionGuard],
    data: { permissions: [PERMISSIONS.PARKING_READ, PERMISSIONS.PARKING_MANAGE] },
    loadChildren: () => import('./features/parking/parking.module').then( m => m.ParkingModule)
  },
  {
    path: 'storages',
    canActivate: [PermissionGuard],
    data: { permissions: [PERMISSIONS.STORAGES_READ, PERMISSIONS.STORAGES_MANAGE] },
    loadChildren: () => import('./features/storages/storages.module').then( m => m.StoragesModule)
  },
  {
    path: 'messaging',
    canActivate: [PermissionGuard],
    data: { permissions: [PERMISSIONS.MESSAGING_READ, PERMISSIONS.MESSAGING_CREATE] },
    loadChildren: () => import('./features/messaging/messaging.module').then( m => m.MessagingModule)
  },
  {
    path: 'notifications',
    canActivate: [PermissionGuard],
    data: { permissions: [PERMISSIONS.NOTIFICATIONS_READ] },
    loadChildren: () => import('./features/notifications/notifications.module').then( m => m.NotificationsModule)
  },
  {
    path: 'audit',
    canActivate: [PermissionGuard],
    data: { permissions: [PERMISSIONS.AUDIT_READ] },
    loadChildren: () => import('./features/audit/audit.module').then( m => m.AuditModule)
  },
  {
    path: 'users',
    canActivate: [PermissionGuard],
    data: { permissions: [PERMISSIONS.USERS_READ] },
    loadChildren: () => import('./features/users/users.module').then( m => m.UsersModule)
  },
  {
    path: 'home',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
