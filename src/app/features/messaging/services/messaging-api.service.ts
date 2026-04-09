import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/api/api.models';
import {
  Conversation,
  ConversationDetail,
  Message,
  MessagingUserSummary,
  SendMessageRequest,
} from '../models/messaging.models';

@Injectable({
  providedIn: 'root',
})
export class MessagingApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  listConversations(): Observable<Conversation[]> {
    return this.http
      .get<ApiResponse<Conversation[]>>(`${this.baseUrl}/conversations`)
      .pipe(map((response) => response.data));
  }

  getConversation(id: string): Observable<ConversationDetail> {
    return this.http
      .get<ApiResponse<ConversationDetail>>(`${this.baseUrl}/conversations/${id}`)
      .pipe(map((response) => response.data));
  }

  listMessages(conversationId: string): Observable<Message[]> {
    const params = new HttpParams().set('conversationId', conversationId);
    return this.http
      .get<ApiResponse<Message[]>>(`${this.baseUrl}/messages`, { params })
      .pipe(map((response) => response.data));
  }

  sendMessage(payload: SendMessageRequest): Observable<Message> {
    return this.http
      .post<ApiResponse<Message>>(`${this.baseUrl}/messages`, payload)
      .pipe(map((response) => response.data));
  }

  markAsRead(messageId: string): Observable<Message> {
    return this.http
      .patch<ApiResponse<Message>>(`${this.baseUrl}/messages/${messageId}/read`, {})
      .pipe(map((response) => response.data));
  }

  listContacts(): Observable<MessagingUserSummary[]> {
    return this.http
      .get<ApiResponse<MessagingUserSummary[]>>(`${this.baseUrl}/messages/contacts`)
      .pipe(map((response) => response.data));
  }
}
