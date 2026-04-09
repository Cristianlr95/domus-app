import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { GuestGuard } from './core/guards/guest.guard';

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
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/visits/visits.module').then( m => m.VisitsModule)
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
