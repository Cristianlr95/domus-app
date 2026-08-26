import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { OperationsRoutingModule } from './operations-routing.module';
import { OperationsCenterPage } from './pages/operations-center/operations-center.page';

@NgModule({
  declarations: [OperationsCenterPage],
  imports: [CommonModule, FormsModule, IonicModule, OperationsRoutingModule],
})
export class OperationsModule {}
