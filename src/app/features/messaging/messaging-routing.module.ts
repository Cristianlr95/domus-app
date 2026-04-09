import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { ConversationDetailPage } from './pages/conversation-detail/conversation-detail.page';
import { ConversationsListPage } from './pages/conversations-list/conversations-list.page';
import { MessageComposePage } from './pages/message-compose/message-compose.page';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: ConversationsListPage,
  },
  {
    path: 'new',
    canActivate: [AuthGuard],
    component: MessageComposePage,
  },
  {
    path: ':id',
    canActivate: [AuthGuard],
    component: ConversationDetailPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MessagingRoutingModule {}
