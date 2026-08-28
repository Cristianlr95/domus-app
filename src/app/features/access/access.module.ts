import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AccessRoutingModule } from './access-routing.module';
import { AccessPage } from './pages/access.page';

@NgModule({ declarations: [AccessPage], imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule, AccessRoutingModule] })
export class AccessModule {}
