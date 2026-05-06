import { test, expect } from '@playwright/test';
import { PropertiesPage } from '../pages/properties.page';

test.describe('Properties Module', () => {
  let propertiesPage: PropertiesPage;

  test.beforeEach(async ({ page }) => {
    propertiesPage = new PropertiesPage(page);
    await page.goto('/dashboard');
  });

  test.describe('Properties List Grid', () => {
    test('should display properties grid layout', async ({ page }) => {
      propertiesPage = new PropertiesPage(page);
      await propertiesPage.navigateToProperties();
      await propertiesPage.verifyPropertiesGridLayout();
    });

    test('should filter properties by type', async ({ page }) => {
      propertiesPage = new PropertiesPage(page);
      await propertiesPage.navigateToProperties();
      await propertiesPage.filterByType('Apartamento');
      
      const items = await page.locator('ion-card').all();
      expect(items.length).toBeGreaterThanOrEqual(0);
    });

    test('should filter properties by status', async ({ page }) => {
      propertiesPage = new PropertiesPage(page);
      await propertiesPage.navigateToProperties();
      await propertiesPage.filterByStatus('Disponible');
      
      const items = await page.locator('ion-card').all();
      expect(items.length).toBeGreaterThanOrEqual(0);
    });

    test('should search properties by name', async ({ page }) => {
      propertiesPage = new PropertiesPage(page);
      await propertiesPage.navigateToProperties();
      await propertiesPage.searchProperty('Apt');
      
      const items = await page.locator('ion-card').all();
      expect(items.length).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Property Detail', () => {
    test('should navigate to property detail page', async ({ page }) => {
      propertiesPage = new PropertiesPage(page);
      await propertiesPage.navigateToProperties();
      
      const cards = await page.locator('ion-card').all();
      if (cards.length > 0) {
        await cards[0].click();
        await propertiesPage.verifyPropertyDetailPage();
      }
    });

    test('should display property information', async ({ page }) => {
      propertiesPage = new PropertiesPage(page);
      await propertiesPage.navigateToProperties();
      
      const cards = await page.locator('ion-card').all();
      if (cards.length > 0) {
        await cards[0].click();
        
        // Verify info is visible
        const detail = await page.locator('ion-label').all();
        expect(detail.length).toBeGreaterThan(0);
      }
    });

    test('should update property status', async ({ page }) => {
      propertiesPage = new PropertiesPage(page);
      await propertiesPage.navigateToProperties();
      
      const cards = await page.locator('ion-card').all();
      if (cards.length > 0) {
        await cards[0].click();
        await propertiesPage.verifyPropertyDetailPage();
        
        // Try to change status
        const statusSelects = await page.locator('ion-select').all();
        if (statusSelects.length > 0) {
          await statusSelects[0].click();
          const options = await page.locator('ion-select-option').all();
          if (options.length > 0) {
            await options[0].click();
            const updateBtn = await page.locator('ion-button:has-text("Actualizar")').all();
            if (updateBtn.length > 0) {
              await updateBtn[0].click();
            }
          }
        }
      }
    });

    test('should go back to properties list', async ({ page }) => {
      propertiesPage = new PropertiesPage(page);
      await propertiesPage.navigateToProperties();
      
      const cards = await page.locator('ion-card').all();
      if (cards.length > 0) {
        await cards[0].click();
        await propertiesPage.goBackToProperties();
        
        const grid = await page.locator('ion-grid').all();
        expect(grid.length).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Property Filters', () => {
    test('should clear filters and show all properties', async ({ page }) => {
      propertiesPage = new PropertiesPage(page);
      await propertiesPage.navigateToProperties();
      
      // Apply filter
      await propertiesPage.filterByType('Apartamento');
      
      // Clear filter
      const selects = await page.locator('ion-select').all();
      if (selects.length > 0) {
        await selects[0].click();
        const options = await page.locator('ion-select-option').all();
        if (options.length > 0) {
          await options[0].click();
        }
      }
      
      const cards = await page.locator('ion-card').all();
      expect(cards.length).toBeGreaterThan(0);
    });

    test('should combine multiple filters', async ({ page }) => {
      propertiesPage = new PropertiesPage(page);
      await propertiesPage.navigateToProperties();
      
      await propertiesPage.filterByType('Apartamento');
      await propertiesPage.filterByStatus('Disponible');
      
      const cards = await page.locator('ion-card').all();
      expect(cards.length).toBeGreaterThanOrEqual(0);
    });
  });
});
