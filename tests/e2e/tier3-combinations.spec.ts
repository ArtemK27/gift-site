import { test, expect } from '@playwright/test';
import { unlockToHomeScreen, launchApp } from './helpers';

test.describe('Tier 3: Cross-Feature Combinations', () => {

  // ================= 3.1: Settings Sound/Haptics Across Apps =================
  test.describe('Settings Global State Across Applications', () => {
    test('3.1.1: toggling sound OFF in localStorage persists across all apps and navigation', async ({ page }) => {
      // Set sound to false in localStorage before page load
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.setItem(
          'ios18_gift_settings',
          JSON.stringify({ soundEnabled: false, hapticsEnabled: false, wallpaper: 'sangwoo' })
        );
      });

      // Reload to ensure settings provider loads persisted state
      await page.reload();
      await unlockToHomeScreen(page);

      // Verify that sound is disabled at runtime
      const soundEnabled = await page.evaluate(() => {
        const raw = localStorage.getItem('ios18_gift_settings');
        return raw ? JSON.parse(raw).soundEnabled : true;
      });
      expect(soundEnabled).toBe(false);

      // Open Messenger
      await launchApp(page, 'ПодвалГрам');
      await expect(page.locator('text=ПодвалГрам').first()).toBeVisible();

      // Return home
      await page.locator('#ios-home-indicator').click();
      await expect(page.locator('text=Квест Сейфа')).toBeVisible({ timeout: 5000 });

      // Open Safe
      await launchApp(page, 'VIP Сейф');
      await expect(page.locator('text=VIP Сейф 2027')).toBeVisible();

      // Sound should still be disabled
      const currentSound = await page.evaluate(() => {
        const raw = localStorage.getItem('ios18_gift_settings');
        return raw ? JSON.parse(raw).soundEnabled : true;
      });
      expect(currentSound).toBe(false);
    });
  });

  // ================= 3.2: Rapid App Switching =================
  test.describe('Rapid App Switching Combinations', () => {
    test.beforeEach(async ({ page }) => {
      await unlockToHomeScreen(page);
    });

    test('3.2.1: switching rapidly between Messenger, Notes, and Safe maintains clean state', async ({ page }) => {
      // Open Messenger
      await launchApp(page, 'ПодвалГрам');
      await expect(page.locator('text=ПодвалГрам').first()).toBeVisible();

      // Close via Home Indicator
      await page.locator('#ios-home-indicator').click();
      await expect(page.locator('text=Квест Сейфа')).toBeVisible({ timeout: 5000 });

      // Immediately open Notes
      await launchApp(page, 'Заметки');
      await expect(page.locator('text=Заметки').first()).toBeVisible();

      // Close via back button
      await page.locator('button[aria-label="Назад к списку"]').click();
      await expect(page.locator('text=Квест Сейфа')).toBeVisible({ timeout: 5000 });

      // Immediately open Safe
      await launchApp(page, 'VIP Сейф');
      await expect(page.locator('text=VIP Сейф 2027')).toBeVisible();

      // Close via back button
      await page.locator('button[aria-label="Назад из Сейфа"]').click();
      await expect(page.locator('text=Квест Сейфа')).toBeVisible({ timeout: 5000 });
    });
  });

  // ================= 3.3: LockScreen Notification Deep-Linking =================
  test.describe('LockScreen Deep-Link Routing', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.locator('text=Открыть поздравление').click();
      await expect(page.locator('text=Смахните вверх для разблокировки')).toBeVisible({ timeout: 10000 });
    });

    test('3.3.1: tapping notification from Сану navigates directly into MessengerApp', async ({ page }) => {
      // Tap notification 1
      await page.locator('text=Сану').first().click();

      // Should open directly into Messenger
      await expect(page.locator('text=ПодвалГрам').first()).toBeVisible({ timeout: 10000 });
      await expect(page.getByRole('button', { name: 'Открыть чат Новогодний Комитет 🎄' })).toBeVisible();
    });

    test('3.3.2: tapping Security notification navigates directly into SafeApp', async ({ page }) => {
      // Tap Security notification
      await page.locator('text=Система Безопасности').first().click();

      // Should open directly into SafeApp
      await expect(page.locator('text=VIP Сейф 2027')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('text=Введите 4-значный ПИН-код')).toBeVisible();
    });

    test('3.3.3: tapping quick Camera button navigates directly into GalleryApp', async ({ page }) => {
      const cameraBtn = page.locator('button[title="Камера"]');
      await expect(cameraBtn).toBeVisible();
      await cameraBtn.click();

      // Should open directly into GalleryApp
      await expect(page.locator('text=Новогодний Альбом')).toBeVisible({ timeout: 10000 });
    });
  });

  // ================= 3.4: Wallpaper Theme Combinations =================
  test.describe('Theme & Wallpaper Selection', () => {
    test('3.4.1: changing wallpaper theme persists across reloads', async ({ page }) => {
      await page.goto('/');

      // Set wallpaper to sisheng
      await page.evaluate(() => {
        localStorage.setItem(
          'ios18_gift_settings',
          JSON.stringify({ soundEnabled: true, hapticsEnabled: true, wallpaper: 'sisheng' })
        );
      });

      await page.reload();
      const stored = await page.evaluate(() => {
        const raw = localStorage.getItem('ios18_gift_settings');
        return raw ? JSON.parse(raw).wallpaper : null;
      });

      expect(stored).toBe('sisheng');
    });
  });

});
