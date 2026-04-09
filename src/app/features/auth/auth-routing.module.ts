import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GuestGuard } from '../../core/guards/guest.guard';
import { LoginPage } from './pages/login/login.page';

const routes: Routes = [
  {
    path: '',
    component: LoginPage,
    canActivate: [GuestGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
