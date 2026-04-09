import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuditRoutingModule } from './audit-routing.module';
import { AuditDetailPage } from './pages/audit-detail/audit-detail.page';
import { AuditListPage } from './pages/audit-list/audit-list.page';

@NgModule({
  declarations: [AuditListPage, AuditDetailPage],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AuditRoutingModule,
  ],
})
export class AuditModule {}
