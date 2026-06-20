import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { finalize, forkJoin, of } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { PERMISSIONS } from '../../../../core/auth/auth.models';
import { AuthorizationService } from '../../../../core/auth/authorization.service';
import { FeedbackService } from '../../../../core/services/feedback.service';
import { NotificationsApiService } from '../../../notifications/services/notifications-api.service';
import { ConversationDetail, Message } from '../../models/messaging.models';
import { MessagingApiService } from '../../services/messaging-api.service';

@Component({
  selector: 'app-conversation-detail-page',
  templateUrl: './conversation-detail.page.html',
  styleUrls: ['./conversation-detail.page.scss'],
  standalone: false,
})
export class ConversationDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);
  private readonly messagingApiService = inject(MessagingApiService);
  private readonly feedbackService = inject(FeedbackService);
  readonly authService = inject(AuthService);
  private readonly authorizationService = inject(AuthorizationService);
  private readonly notificationsApiService = inject(NotificationsApiService);

  readonly form = this.formBuilder.nonNullable.group({
    content: ['', [Validators.required, Validators.maxLength(2000)]],
  });

  conversation: ConversationDetail | null = null;
  loading = false;
  sending = false;

  get canCreateMessages(): boolean {
    return this.authorizationService.hasPermission(PERMISSIONS.MESSAGING_CREATE);
  }

  ionViewWillEnter(): void {
    this.loadConversation();
  }

  refresh(): void {
    this.loadConversation();
  }

  isOwnMessage(message: Message): boolean {
    return message.sender.id === this.authService.currentUser()?.id;
  }

  submit(): void {
    if (!this.canCreateMessages || !this.conversation || this.form.invalid || this.sending) {
      this.form.markAllAsTouched();
      return;
    }

    const content = this.form.getRawValue().content.trim();
    if (!content) {
      this.form.markAllAsTouched();
      return;
    }

    this.sending = true;
    this.messagingApiService.sendMessage({
      recipientUserId: this.conversation.otherParticipant.id,
      content,
    })
      .pipe(finalize(() => {
        this.sending = false;
      }))
      .subscribe({
        next: async () => {
          this.form.reset({ content: '' });
          this.loadConversation();
          this.notificationsApiService.loadUnreadCount().subscribe();
          await this.feedbackService.success('Mensaje enviado.');
        },
        error: async (error) => {
          await this.feedbackService.error(this.authService.getErrorMessage(error));
        },
      });
  }

  private loadConversation(): void {
    const conversationId = this.route.snapshot.paramMap.get('id');
    if (!conversationId) {
      return;
    }

    this.loading = true;
    this.messagingApiService.getConversation(conversationId)
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: (conversation) => {
          this.conversation = conversation;
          this.markUnreadMessages(conversation);
        },
        error: async (error) => {
          await this.feedbackService.error(this.authService.getErrorMessage(error));
        },
      });
  }

  private markUnreadMessages(conversation: ConversationDetail): void {
    const currentUserId = this.authService.currentUser()?.id;
    if (!currentUserId) {
      return;
    }

    const unreadMessages = conversation.messages.filter(
      (message) => message.recipient.id === currentUserId && message.status === 'ENVIADO'
    );

    if (unreadMessages.length === 0) {
      return;
    }

    forkJoin(unreadMessages.map((message) => this.messagingApiService.markAsRead(message.id)))
      .subscribe({
        next: (updatedMessages) => {
          if (!this.conversation) {
            return;
          }

          const updates = new Map(updatedMessages.map((message) => [message.id, message]));
          this.conversation = {
            ...this.conversation,
            unreadCount: 0,
            messages: this.conversation.messages.map((message) => updates.get(message.id) ?? message),
          };
          this.notificationsApiService.loadUnreadCount().subscribe();
        },
        error: () => {
          void of(null);
        },
      });
  }
}
