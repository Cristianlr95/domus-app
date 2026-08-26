import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OperationsCenterPage } from './pages/operations-center/operations-center.page';

const routes: Routes = [{ path: '', component: OperationsCenterPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OperationsRoutingModule {}
