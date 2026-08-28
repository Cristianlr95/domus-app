import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PERMISSIONS } from '../../core/auth/auth.models';
import { PermissionGuard } from '../../core/guards/permission.guard';
import { AccessPage } from './pages/access.page';

const routes: Routes = [{ path: '', component: AccessPage, canActivate: [PermissionGuard], data: { permissions: [PERMISSIONS.ACCESS_MANAGE, PERMISSIONS.ACCESS_REQUEST] } }];
@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class AccessRoutingModule {}
