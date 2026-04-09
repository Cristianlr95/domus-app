import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AppComponent } from './app.component';
import { AuthService } from './core/auth/auth.service';
import { NotificationsApiService } from './features/notifications/services/notifications-api.service';

describe('AppComponent', () => {
  const authServiceMock = {
    restoreSession: jasmine.createSpy('restoreSession').and.returnValue(of(null)),
  };

  const notificationsApiServiceMock = {
    loadUnreadCount: jasmine.createSpy('loadUnreadCount').and.returnValue(of({ unreadCount: 0 })),
    clearUnreadCount: jasmine.createSpy('clearUnreadCount'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
        {
          provide: NotificationsApiService,
          useValue: notificationsApiServiceMock,
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

});
