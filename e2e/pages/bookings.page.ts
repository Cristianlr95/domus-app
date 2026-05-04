import { Page, expect } from '@playwright/test';

export class BookingsPage {
  constructor(private page: Page) {}

  async navigateToDashboard() {
    await this.page.goto('/dashboard');
  }

  async navigateToBookings() {
    await this.page.click('ion-menu a[href*="/bookings"]');
    await this.page.waitForURL('**/bookings');
  }

  async clickNewBooking() {
    await this.page.click('ion-fab-button');
    await this.page.waitForURL('**/bookings/new');
  }

  async selectSpace(spaceName: string) {
    await this.page.click('ion-select[formControlName="spaceId"]');
    await this.page.click(`ion-select-option:has-text("${spaceName}")`);
  }

  async selectDate(date: string) {
    await this.page.fill('ion-input[formControlName="date"]', date);
  }

  async selectStartTime(time: string) {
    await this.page.fill('ion-input[formControlName="startTime"]', time);
  }

  async selectEndTime(time: string) {
    await this.page.fill('ion-input[formControlName="endTime"]', time);
  }

  async enterGuests(number: string) {
    await this.page.fill('ion-input[formControlName="numberOfGuests"]', number);
  }

  async clickCreateBooking() {
    await this.page.click('ion-button:has-text("Crear Reserva")');
  }

  async verifyBookingCreated() {
    await this.page.waitForSelector('ion-toast:has-text("Reserva creada")');
  }

  async filterByStatus(status: string) {
    await this.page.click('ion-select[[(ngModel)]="selectedStatus"]');
    await this.page.click(`ion-select-option:has-text("${status}")`);
  }

  async searchBooking(term: string) {
    await this.page.fill('ion-input[placeholder="Buscar"]', term);
  }

  async verifyBookingVisible(spaceName: string) {
    await expect(this.page.locator(`ion-card:has-text("${spaceName}")`)).toBeVisible();
  }

  async clickBookingDetail(index: number = 0) {
    const bookingItems = await this.page.locator('ion-card').all();
    if (bookingItems[index]) {
      await bookingItems[index].click();
    }
  }

  async verifyBookingDetailPage() {
    await this.page.waitForURL('**/bookings/*');
    await expect(this.page.locator('h1:has-text("Detalle de Reserva")')).toBeVisible();
  }

  async cancelBooking() {
    await this.page.click('ion-button:has-text("Cancelar Reserva")');
    await this.page.click('ion-button:has-text("Confirmar")');
  }

  async verifyCancellationToast() {
    await this.page.waitForSelector('ion-toast:has-text("cancelada")');
  }

  async changeBookingStatus(newStatus: string) {
    await this.page.click('ion-select[formControlName="status"]');
    await this.page.click(`ion-select-option:has-text("${newStatus}")`);
    await this.page.click('ion-button:has-text("Actualizar")');
  }

  async goBackToBookings() {
    await this.page.click('ion-back-button');
  }
}
