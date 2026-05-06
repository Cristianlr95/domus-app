import { Page, expect } from '@playwright/test';

export class PropertiesPage {
  constructor(private page: Page) {}

  async navigateToProperties() {
    await this.page.click('ion-menu a[href*="/properties"]');
    await this.page.waitForURL('**/properties');
  }

  async verifyPropertiesGridLayout() {
    await expect(this.page.locator('ion-grid')).toBeVisible();
    const cards = await this.page.locator('ion-card').all();
    expect(cards.length).toBeGreaterThan(0);
  }

  async filterByType(propertyType: string) {
    await this.page.click('ion-select[[(ngModel)]="selectedType"]');
    await this.page.click(`ion-select-option:has-text("${propertyType}")`);
  }

  async filterByStatus(status: string) {
    await this.page.click('ion-select[[(ngModel)]="selectedStatus"]');
    await this.page.click(`ion-select-option:has-text("${status}")`);
  }

  async searchProperty(term: string) {
    await this.page.fill('ion-input[placeholder="Buscar"]', term);
  }

  async verifyPropertyVisible(propertyName: string) {
    await expect(this.page.locator(`ion-card:has-text("${propertyName}")`)).toBeVisible();
  }

  async clickPropertyDetail(index: number = 0) {
    const propertyCards = await this.page.locator('ion-card').all();
    if (propertyCards[index]) {
      await propertyCards[index].click();
    }
  }

  async verifyPropertyDetailPage() {
    await this.page.waitForURL('**/properties/*');
    await expect(this.page.locator('h1:has-text("Detalle de Propiedad")')).toBeVisible();
  }

  async verifyPropertyInfo(info: { type: string; bedrooms: string; bathrooms: string }) {
    await expect(this.page.locator(`text=${info.type}`)).toBeVisible();
    await expect(this.page.locator(`text=Dormitorios: ${info.bedrooms}`)).toBeVisible();
    await expect(this.page.locator(`text=Baños: ${info.bathrooms}`)).toBeVisible();
  }

  async changePropertyStatus(newStatus: string) {
    await this.page.click('ion-select[formControlName="status"]');
    await this.page.click(`ion-select-option:has-text("${newStatus}")`);
    await this.page.click('ion-button:has-text("Actualizar")');
  }

  async verifyStatusUpdateToast() {
    await this.page.waitForSelector('ion-toast:has-text("actualizado")');
  }

  async goBackToProperties() {
    await this.page.click('ion-back-button');
  }

  async verifyEmptyState() {
    await expect(this.page.locator('text=No hay propiedades registradas')).toBeVisible();
  }
}
