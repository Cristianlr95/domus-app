import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MessagingRoutingModule } from './messaging-routing.module';
import { ConversationDetailPage } from './pages/conversation-detail/conversation-detail.page';
import { ConversationsListPage } from './pages/conversations-list/conversations-list.page';
import { MessageComposePage } from './pages/message-compose/message-compose.page';

@NgModule({
  declarations: [ConversationsListPage, ConversationDetailPage, MessageComposePage],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    MessagingRoutingModule,
  ],
})
export class MessagingModule {}
