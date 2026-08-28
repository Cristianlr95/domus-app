import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LaundryRoutingModule } from './laundry-routing.module';
import { LaundryPage } from './pages/laundry/laundry.page';
@NgModule({ declarations: [LaundryPage], imports: [CommonModule, FormsModule, IonicModule, LaundryRoutingModule] }) export class LaundryModule {}
