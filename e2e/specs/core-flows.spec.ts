import { expect, Page, test } from '@playwright/test';

const adminUser = {
  id: 'admin-user',
  firstName: 'Cristian',
  lastName: 'Administrador',
  email: 'cristian.admin@domus.local',
  active: true,
  roles: ['ADMIN'],
  permissions: [
    'admin.dashboard.read',
    'notifications.read',
    'bookings.read',
    'bookings.create',
    'bookings.update',
    'messaging.read',
    'messaging.create',
  ],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const residentUser = {
  ...adminUser,
  id: 'resident-user',
  firstName: 'Valentina',
  lastName: 'Residente',
  email: 'valentina.residente@domus.local',
  roles: ['RESIDENTE'],
  permissions: [
    'notifications.read',
    'bookings.read',
    'bookings.create',
    'messaging.read',
    'messaging.create',
  ],
};

async function mockApi(page: Page, currentUser = adminUser): Promise<void> {
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;

    if (path.endsWith('/auth/login')) {
      await route.fulfill({
        json: {
          data: {
            tokenType: 'Bearer',
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
            expiresIn: 28800,
            refreshExpiresIn: 1209600,
            user: currentUser,
          },
        },
      });
      return;
    }

    if (path.endsWith('/users/me')) {
      await route.fulfill({ json: { data: currentUser } });
      return;
    }

    if (path.endsWith('/notifications/unread-count')) {
      await route.fulfill({ json: { data: { unreadCount: 1 } } });
      return;
    }

    if (path.endsWith('/notifications/preferences')) {
      const preferences = [
        { type: 'PACKAGE_RECEIVED', enabled: true },
        { type: 'VISIT_REGISTERED', enabled: true },
        { type: 'MESSAGE_RECEIVED', enabled: true },
        { type: 'SYSTEM_EVENT', enabled: false },
      ];
      await route.fulfill({ json: { data: preferences } });
      return;
    }

    if (path.endsWith('/notifications')) {
      await route.fulfill({
        json: {
          data: [{
            id: 'notification-1',
            type: 'PACKAGE_RECEIVED',
            title: 'Nueva encomienda',
            message: 'Tu encomienda está disponible.',
            read: false,
            readAt: null,
            referenceType: 'PACKAGE',
            referenceId: 'package-1',
            route: '/resident',
            createdAt: '2026-06-19T12:00:00Z',
            updatedAt: '2026-06-19T12:00:00Z',
          }],
        },
      });
      return;
    }

    if (path.endsWith('/bookings')) {
      await route.fulfill({ json: { data: [] } });
      return;
    }

    if (path.endsWith('/conversations')) {
      await route.fulfill({ json: { data: [] } });
      return;
    }

    if (path.endsWith('/visits')) {
      await route.fulfill({ json: { data: [] } });
      return;
    }

    if (path.endsWith('/packages')) {
      await route.fulfill({ json: { data: [] } });
      return;
    }

    await route.fulfill({ json: { data: null } });
  });
}

async function seedSession(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem('domus.access_token', 'access-token');
    localStorage.setItem('domus.refresh_token', 'refresh-token');
  });
}

test('login creates a session and opens the authenticated dashboard', async ({ page }) => {
  await mockApi(page);
  await page.goto('/login');

  await page.locator('ion-input[formcontrolname="email"] input').fill(adminUser.email);
  await page.locator('ion-input[formcontrolname="password"] input').fill('DomusReal2026!');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByText('Hola, Cristian Administrador')).toBeVisible();
  await expect(page.evaluate(() => localStorage.getItem('domus.refresh_token'))).resolves.toBe('refresh-token');
});

test('resident session opens a private operational portal', async ({ page }) => {
  await page.setViewportSize({ width: 412, height: 915 });
  await mockApi(page, residentUser);
  await seedSession(page);
  await page.goto('/dashboard');

  await expect(page).toHaveURL(/\/resident$/);
  await expect(page.getByRole('heading', { name: 'Hola, Valentina', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Mis reservas' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Mis visitas' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Mis encomiendas' })).toBeVisible();
  await expect(page.locator('.mobile-nav')).toBeVisible();
  expect(await page.locator('.mobile-nav a, .mobile-nav button').count()).toBeLessThanOrEqual(5);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('notification preferences are loaded and can be saved', async ({ page }) => {
  await mockApi(page, residentUser);
  await seedSession(page);
  await page.goto('/notifications');

  await expect(page.getByRole('heading', { name: 'Preferencias' })).toBeVisible();
  await expect(page.getByText('Encomiendas recibidas')).toBeVisible();
  await page.getByRole('button', { name: 'Guardar preferencias' }).click();
  await expect(page.getByText('Preferencias actualizadas.')).toBeVisible();
});
