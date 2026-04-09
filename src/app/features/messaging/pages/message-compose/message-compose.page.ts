import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { FeedbackService } from '../../../../core/services/feedback.service';
import { MessagingUserSummary } from '../../models/messaging.models';
import { MessagingApiService } from '../../services/messaging-api.service';

@Component({
  selector: 'app-message-compose-page',
  templateUrl: './message-compose.page.html',
  styleUrls: ['./message-compose.page.scss'],
  standalone: false,
})
export class MessageComposePage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly messagingApiService = inject(MessagingApiService);
  private readonly feedbackService = inject(FeedbackService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.formBuilder.nonNullable.group({
    recipientUserId: ['', [Validators.required]],
    content: ['', [Validators.required, Validators.maxLength(2000)]],
  });

  contacts: MessagingUserSummary[] = [];
  loading = false;
  submitting = false;

  ionViewWillEnter(): void {
    this.loadContacts();
  }

  submit(): void {
    if (this.form.invalid || this.submitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const payload = this.form.getRawValue();
    this.messagingApiService.sendMessage({
      recipientUserId: payload.recipientUserId,
      content: payload.content.trim(),
    })
      .pipe(finalize(() => {
        this.submitting = false;
      }))
      .subscribe({
        next: async (message) => {
          await this.feedbackService.success('Mensaje enviado correctamente.');
          await this.router.navigate(['/messaging', message.conversationId]);
        },
        error: async (error) => {
          await this.feedbackService.error(this.authService.getErrorMessage(error));
        },
      });
  }

  private loadContacts(): void {
    this.loading = true;
    this.messagingApiService.listContacts()
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: (contacts) => {
          this.contacts = contacts;
        },
        error: async (error) => {
          await this.feedbackService.error(this.authService.getErrorMessage(error));
        },
      });
  }
}
