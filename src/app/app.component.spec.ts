import { CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { AppComponent } from './app.component';
import { AuthService } from './core/auth/auth.service';
import { AuthorizationService } from './core/auth/authorization.service';
import { NotificationsApiService } from './features/notifications/services/notifications-api.service';

describe('AppComponent', () => {
  const authServiceMock = {
    currentUser: signal(null),
    restoreSession: jasmine.createSpy('restoreSession').and.returnValue(of(null)),
    logout: jasmine.createSpy('logout'),
  };

  const authorizationServiceMock = {
    hasAnyPermission: jasmine.createSpy('hasAnyPermission').and.returnValue(true),
  };

  const notificationsApiServiceMock = {
    unreadCount: signal(0),
    loadUnreadCount: jasmine.createSpy('loadUnreadCount').and.returnValue(of({ unreadCount: 0 })),
    clearUnreadCount: jasmine.createSpy('clearUnreadCount'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [RouterTestingModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
        {
          provide: AuthorizationService,
          useValue: authorizationServiceMock,
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
