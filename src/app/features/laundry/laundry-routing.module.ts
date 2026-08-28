import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PERMISSIONS } from '../../core/auth/auth.models';
import { PermissionGuard } from '../../core/guards/permission.guard';
import { LaundryPage } from './pages/laundry/laundry.page';
const routes: Routes = [{ path: '', component: LaundryPage, canActivate: [PermissionGuard], data: { permissions: [PERMISSIONS.LAUNDRY_MANAGE, PERMISSIONS.LAUNDRY_REQUEST] } }];
@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] }) export class LaundryRoutingModule {}
