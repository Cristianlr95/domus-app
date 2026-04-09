import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PERMISSIONS } from '../../core/auth/auth.models';
import { PermissionGuard } from '../../core/guards/permission.guard';
import { ConversationDetailPage } from './pages/conversation-detail/conversation-detail.page';
import { ConversationsListPage } from './pages/conversations-list/conversations-list.page';
import { MessageComposePage } from './pages/message-compose/message-compose.page';

const routes: Routes = [
  {
    path: '',
    canActivate: [PermissionGuard],
    data: { permissions: [PERMISSIONS.MESSAGING_READ] },
    component: ConversationsListPage,
  },
  {
    path: 'new',
    canActivate: [PermissionGuard],
    data: { permissions: [PERMISSIONS.MESSAGING_CREATE] },
    component: MessageComposePage,
  },
  {
    path: ':id',
    canActivate: [PermissionGuard],
    data: { permissions: [PERMISSIONS.MESSAGING_READ] },
    component: ConversationDetailPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MessagingRoutingModule {}
