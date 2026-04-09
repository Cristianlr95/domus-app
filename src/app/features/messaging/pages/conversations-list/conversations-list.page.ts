import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { FeedbackService } from '../../../../core/services/feedback.service';
import { Conversation } from '../../models/messaging.models';
import { MessagingApiService } from '../../services/messaging-api.service';

@Component({
  selector: 'app-conversations-list-page',
  templateUrl: './conversations-list.page.html',
  styleUrls: ['./conversations-list.page.scss'],
  standalone: false,
})
export class ConversationsListPage {
  private readonly messagingApiService = inject(MessagingApiService);
  private readonly feedbackService = inject(FeedbackService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  conversations: Conversation[] = [];
  loading = false;

  ionViewWillEnter(): void {
    this.loadConversations();
  }

  refresh(): void {
    this.loadConversations();
  }

  createConversation(): void {
    void this.router.navigate(['/messaging/new']);
  }

  openConversation(conversationId: string): void {
    void this.router.navigate(['/messaging', conversationId]);
  }

  trackByConversation(_index: number, conversation: Conversation): string {
    return conversation.id;
  }

  private loadConversations(): void {
    this.loading = true;
    this.messagingApiService.listConversations()
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: (conversations) => {
          this.conversations = conversations;
        },
        error: async (error) => {
          await this.feedbackService.error(this.authService.getErrorMessage(error));
        },
      });
  }
}
