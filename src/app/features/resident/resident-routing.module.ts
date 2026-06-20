import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ResidentDashboardPage } from './pages/resident-dashboard/resident-dashboard.page';

const routes: Routes = [
  {
    path: '',
    component: ResidentDashboardPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ResidentRoutingModule {}
