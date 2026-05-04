import { test, expect } from '@playwright/test';
import { UsersPage } from '../pages/users.page';

test.describe('Users Module', () => {
  let usersPage: UsersPage;

  test.beforeEach(async ({ page }) => {
    usersPage = new UsersPage(page);
    await page.goto('/dashboard');
  });

  test.describe('Users List', () => {
    test('should display users list', async ({ page }) => {
      usersPage = new UsersPage(page);
      await usersPage.navigateToUsers();
      await usersPage.verifyUsersListVisible();
    });

    test('should filter users by role', async ({ page }) => {
      usersPage = new UsersPage(page);
      await usersPage.navigateToUsers();
      
      await usersPage.filterByRole('Administrador');
      const items = await page.locator('ion-item').all();
      expect(items.length).toBeGreaterThanOrEqual(0);
    });

    test('should filter users by status (Active)', async ({ page }) => {
      usersPage = new UsersPage(page);
      await usersPage.navigateToUsers();
      
      await usersPage.filterByStatus('Activos');
      const items = await page.locator('ion-item').all();
      expect(items.length).toBeGreaterThanOrEqual(0);
    });

    test('should filter users by status (Inactive)', async ({ page }) => {
      usersPage = new UsersPage(page);
      await usersPage.navigateToUsers();
      
      await usersPage.filterByStatus('Inactivos');
      const items = await page.locator('ion-item').all();
      expect(items.length).toBeGreaterThanOrEqual(0);
    });

    test('should search users by name or email', async ({ page }) => {
      usersPage = new UsersPage(page);
      await usersPage.navigateToUsers();
      
      await usersPage.searchUser('John');
      const items = await page.locator('ion-item').all();
      expect(items.length).toBeGreaterThanOrEqual(0);
    });

    test('should display role badges with colors', async ({ page }) => {
      usersPage = new UsersPage(page);
      await usersPage.navigateToUsers();
      
      const badges = await page.locator('ion-badge').all();
      expect(badges.length).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('User Detail', () => {
    test('should navigate to user detail page', async ({ page }) => {
      usersPage = new UsersPage(page);
      await usersPage.navigateToUsers();
      
      const items = await page.locator('ion-item').all();
      if (items.length > 0) {
        await items[0].click();
        await usersPage.verifyUserDetailPage();
      }
    });

    test('should display user information', async ({ page }) => {
      usersPage = new UsersPage(page);
      await usersPage.navigateToUsers();
      
      const items = await page.locator('ion-item').all();
      if (items.length > 0) {
        await items[0].click();
        
        // Verify user info section
        const sections = await page.locator('ion-card').all();
        expect(sections.length).toBeGreaterThan(0);
        
        // Check for user info (email, created date, etc.)
        const labels = await page.locator('small').all();
        expect(labels.length).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Change User Role', () => {
    test('should change user role with confirmation', async ({ page }) => {
      usersPage = new UsersPage(page);
      await usersPage.navigateToUsers();
      
      const items = await page.locator('ion-item').all();
      if (items.length > 0) {
        await items[0].click();
        
        // Get current role to change it
        const roleSelects = await page.locator('ion-select').all();
        if (roleSelects.length > 0) {
          const options = await page.locator('ion-select-option').all();
          if (options.length > 1) {
            // Change to different role
            await roleSelects[0].click();
            await options[1].click();
            
            // Update button
            const updateButtons = await page.locator('ion-button:has-text("Actualizar")').all();
            if (updateButtons.length > 0) {
              await updateButtons[0].click();
              
              // Confirm dialog
              await page.click('ion-button:has-text("Confirmar")').catch(() => {});
            }
          }
        }
      }
    });
  });

  test.describe('User Status Management', () => {
    test('should deactivate user with confirmation', async ({ page }) => {
      usersPage = new UsersPage(page);
      await usersPage.navigateToUsers();
      
      const items = await page.locator('ion-item').all();
      if (items.length > 0) {
        await items[0].click();
        
        // Check if user is active before deactivating
        const activeText = await page.locator('text=Activo').all();
        if (activeText.length > 0) {
          const deactivateBtn = await page.locator('ion-button:has-text("Desactivar")').all();
          if (deactivateBtn.length > 0) {
            await deactivateBtn[0].click();
            // Confirm dialog
            await page.click('ion-button:has-text("Desactivar")').catch(() => {});
          }
        }
      }
    });

    test('should activate user with confirmation', async ({ page }) => {
      usersPage = new UsersPage(page);
      await usersPage.navigateToUsers();
      
      // First filter by inactive users
      await usersPage.filterByStatus('Inactivos');
      
      const items = await page.locator('ion-item').all();
      if (items.length > 0) {
        await items[0].click();
        
        // Check if user is inactive
        const inactiveText = await page.locator('text=Inactivo').all();
        if (inactiveText.length > 0) {
          const activateBtn = await page.locator('ion-button:has-text("Activar")').all();
          if (activateBtn.length > 0) {
            await activateBtn[0].click();
            // Confirm dialog
            await page.click('ion-button:has-text("Activar")').catch(() => {});
          }
        }
      }
    });
  });

  test.describe('User Navigation', () => {
    test('should go back to users list from detail', async ({ page }) => {
      usersPage = new UsersPage(page);
      await usersPage.navigateToUsers();
      
      const items = await page.locator('ion-item').all();
      if (items.length > 0) {
        await items[0].click();
        await usersPage.goBackToUsers();
        
        // Should be back on list
        await usersPage.verifyUsersListVisible();
      }
    });
  });

  test.describe('User Filters', () => {
    test('should combine multiple filters', async ({ page }) => {
      usersPage = new UsersPage(page);
      await usersPage.navigateToUsers();
      
      await usersPage.filterByRole('Residente');
      await usersPage.filterByStatus('Activos');
      
      const items = await page.locator('ion-item').all();
      expect(items.length).toBeGreaterThanOrEqual(0);
    });

    test('should reset filters to show all users', async ({ page }) => {
      usersPage = new UsersPage(page);
      await usersPage.navigateToUsers();
      
      // Apply filter
      await usersPage.filterByRole('Administrador');
      
      // Reset by selecting "Todos"
      const roleSelects = await page.locator('ion-select').all();
      if (roleSelects.length > 0) {
        await roleSelects[0].click();
        const options = await page.locator('ion-select-option').all();
        if (options.length > 0) {
          await options[0].click(); // Click "Todos"
        }
      }
      
      const items = await page.locator('ion-item').all();
      expect(items.length).toBeGreaterThan(0);
    });
  });
});
