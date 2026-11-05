import { test, expect } from '@playwright/test';

test.describe('Sanity & Initial Load', () => {
  test('loads the app and shows BaitScreen', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Праздничное письмо')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Открыть поздравление')).toBeVisible();
  });
});
