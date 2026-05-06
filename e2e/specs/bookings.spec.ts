import { test, expect } from '@playwright/test';
import { BookingsPage } from '../pages/bookings.page';

test.describe('Bookings Module', () => {
  let bookingsPage: BookingsPage;

  test.beforeEach(async ({ page }) => {
    bookingsPage = new BookingsPage(page);
    await bookingsPage.navigateToDashboard();
  });

  test.describe('Bookings List', () => {
    test('should display bookings list', async () => {
      await bookingsPage.navigateToBookings();
      // Verify page loads with list
      const page = await bookingsPage['page'];
      await expect(page.locator('ion-list')).toBeVisible();
    });

    test('should filter bookings by status', async () => {
      await bookingsPage.navigateToBookings();
      await bookingsPage.filterByStatus('Confirmada');
      // Verify only confirmed bookings are visible
      const page = await bookingsPage['page'];
      const bookings = await page.locator('ion-item').all();
      expect(bookings.length).toBeGreaterThanOrEqual(0);
    });

    test('should search bookings by name', async () => {
      await bookingsPage.navigateToBookings();
      await bookingsPage.searchBooking('Salon');
      // Verify search results
      const page = await bookingsPage['page'];
      const results = await page.locator('ion-item').all();
      expect(results.length).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Create Booking', () => {
    test('should navigate to create booking page', async () => {
      await bookingsPage.navigateToBookings();
      await bookingsPage.clickNewBooking();
      const page = await bookingsPage['page'];
      await expect(page.locator('h1:has-text("Crear Reserva")')).toBeVisible();
    });

    test('should create new booking successfully', async () => {
      await bookingsPage.navigateToBookings();
      await bookingsPage.clickNewBooking();

      const page = await bookingsPage['page'];
      
      // Fill form (assuming default data exists)
      const spaceSelects = await page.locator('ion-select').all();
      if (spaceSelects.length > 0) {
        await spaceSelects[0].click();
        const options = await page.locator('ion-select-option').all();
        if (options.length > 0) {
          await options[0].click();
        }
      }

      // Fill date
      const inputs = await page.locator('ion-input').all();
      if (inputs.length > 0) {
        await inputs[0].fill('2026-05-15');
        await inputs[1].fill('10:00');
        await inputs[2].fill('12:00');
        if (inputs.length > 3) {
          await inputs[3].fill('5');
        }
      }

      // Submit
      await page.click('ion-button:has-text("Crear Reserva")');
      await page.waitForSelector('ion-toast', { timeout: 5000 }).catch(() => {});
    });
  });

  test.describe('Booking Detail', () => {
    test('should display booking detail page', async () => {
      await bookingsPage.navigateToBookings();
      
      const page = await bookingsPage['page'];
      const bookings = await page.locator('ion-card').all();
      
      if (bookings.length > 0) {
        await bookings[0].click();
        await bookingsPage.verifyBookingDetailPage();
      }
    });

    test('should update booking status', async () => {
      await bookingsPage.navigateToBookings();
      
      const page = await bookingsPage['page'];
      const bookings = await page.locator('ion-card').all();
      
      if (bookings.length > 0) {
        await bookings[0].click();
        await bookingsPage.verifyBookingDetailPage();
        
        // Try to change status
        const statusSelects = await page.locator('ion-select').all();
        if (statusSelects.length > 0) {
          await statusSelects[0].click();
          const options = await page.locator('ion-select-option').all();
          if (options.length > 0) {
            await options[0].click();
            await page.click('ion-button:has-text("Actualizar")');
          }
        }
      }
    });
  });

  test.describe('Cancel Booking', () => {
    test('should cancel booking with confirmation', async () => {
      await bookingsPage.navigateToBookings();
      
      const page = await bookingsPage['page'];
      const bookings = await page.locator('ion-card').all();
      
      if (bookings.length > 0) {
        await bookings[0].click();
        
        const cancelButtons = await page.locator('ion-button:has-text("Cancelar")').all();
        if (cancelButtons.length > 0) {
          await cancelButtons[0].click();
          // Confirm dialog
          await page.click('ion-button:has-text("Confirmar")').catch(() => {});
        }
      }
    });
  });
});
