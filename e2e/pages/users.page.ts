import { Page, expect } from '@playwright/test';

export class UsersPage {
  constructor(private page: Page) {}

  async navigateToUsers() {
    await this.page.click('ion-menu a[href*="/users"]');
    await this.page.waitForURL('**/users');
  }

  async verifyUsersListVisible() {
    await expect(this.page.locator('ion-list')).toBeVisible();
    const items = await this.page.locator('ion-item').all();
    expect(items.length).toBeGreaterThan(0);
  }

  async filterByRole(role: string) {
    await this.page.click('ion-select[[(ngModel)]="selectedRole"]');
    await this.page.click(`ion-select-option:has-text("${role}")`);
  }

  async filterByStatus(status: 'Activos' | 'Inactivos') {
    await this.page.click('ion-select[[(ngModel)]="showActive"]');
    await this.page.click(`ion-select-option:has-text("${status}")`);
  }

  async searchUser(term: string) {
    await this.page.fill('ion-input[placeholder="Buscar"]', term);
  }

  async verifyUserVisible(userName: string) {
    await expect(this.page.locator(`h3:has-text("${userName}")`)).toBeVisible();
  }

  async clickUserDetail(index: number = 0) {
    const userItems = await this.page.locator('ion-item').all();
    if (userItems[index]) {
      await userItems[index].click();
    }
  }

  async verifyUserDetailPage() {
    await this.page.waitForURL('**/users/*');
    await expect(this.page.locator('h1:has-text("Detalle de Usuario")')).toBeVisible();
  }

  async verifyUserInfo(info: { email: string; role: string }) {
    await expect(this.page.locator(`text=${info.email}`)).toBeVisible();
    await expect(this.page.locator(`text=${info.role}`)).toBeVisible();
  }

  async changeUserRole(newRole: string) {
    await this.page.click('ion-select[[(ngModel)]="selectedRole"]');
    await this.page.click(`ion-select-option:has-text("${newRole}")`);
    await this.page.click('ion-button:has-text("Actualizar Rol")');
    // Confirm dialog
    await this.page.click('ion-button:has-text("Confirmar")');
  }

  async verifyRoleUpdateToast() {
    await this.page.waitForSelector('ion-toast:has-text("actualizado")');
  }

  async deactivateUser() {
    await this.page.click('ion-button:has-text("Desactivar")');
    // Confirm dialog
    await this.page.click('ion-button:has-text("Desactivar")');
  }

  async activateUser() {
    await this.page.click('ion-button:has-text("Activar")');
    // Confirm dialog
    await this.page.click('ion-button:has-text("Activar")');
  }

  async verifyUserStatusChange(newStatus: 'Activo' | 'Inactivo') {
    await this.page.waitForSelector(`ion-toast:has-text("${newStatus.toLowerCase()}")`);
  }

  async goBackToUsers() {
    await this.page.click('ion-back-button');
  }

  async verifyEmptyState() {
    await expect(this.page.locator('text=No hay usuarios registrados')).toBeVisible();
  }
}
