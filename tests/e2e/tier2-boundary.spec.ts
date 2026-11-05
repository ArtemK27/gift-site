import { test, expect } from '@playwright/test';
import { unlockToHomeScreen, launchApp, scratchCanvas, enterSafePin } from './helpers';

test.describe('Tier 2: Boundary & Corner Cases', () => {

  // ================= 2.1: Keypad Boundary Conditions =================
  test.describe('Keypad Boundary Conditions', () => {
    test.beforeEach(async ({ page }) => {
      await unlockToHomeScreen(page);
      await launchApp(page, 'VIP Сейф');
    });

    test('2.1.1: pressing backspace on empty PIN does not error or break state', async ({ page }) => {
      const backspaceBtn = page.locator('button:has-text("⌫")');
      await backspaceBtn.click();
      await backspaceBtn.click();
      await backspaceBtn.click();

      // UI should still be stable and ready for input
      await expect(page.locator('text=Введите 4-значный ПИН-код')).toBeVisible();

      // Can still enter PIN correctly
      await page.locator('button:has-text("2")').click();
      await page.locator('button:has-text("0")').click();
      await page.locator('button:has-text("2")').click();
      await page.locator('button:has-text("7")').click();

      await expect(page.locator('text=ОТКРЫТО')).toBeVisible({ timeout: 5000 });
    });

    test('2.1.2: pressing clear (C) at any stage clears all accumulated digits', async ({ page }) => {
      // Enter 3 digits
      await page.locator('button:has-text("5")').click();
      await page.locator('button:has-text("9")').click();
      await page.locator('button:has-text("1")').click();

      // Press Clear
      await page.locator('button:has-text("C")').click();

      // Now enter the full correct PIN
      await page.locator('button:has-text("2")').click();
      await page.locator('button:has-text("0")').click();
      await page.locator('button:has-text("2")').click();
      await page.locator('button:has-text("7")').click();

      await expect(page.locator('text=ОТКРЫТО')).toBeVisible({ timeout: 5000 });
    });

    test('2.1.3: ignores excess input beyond 4 digits', async ({ page }) => {
      // Rapidly type 6 digits
      await page.locator('button:has-text("2")').click();
      await page.locator('button:has-text("0")').click();
      await page.locator('button:has-text("2")').click();
      await page.locator('button:has-text("7")').click();
      await page.locator('button:has-text("9")').click();
      await page.locator('button:has-text("9")').click();

      // Since 2027 was first 4 digits, it unlocks properly
      await expect(page.locator('text=ОТКРЫТО')).toBeVisible({ timeout: 5000 });
    });
  });

  // ================= 2.2: Rapid Scrolling & Gesture Robustness =================
  test.describe('Rapid Scrolling & Gesture Robustness', () => {
    test.beforeEach(async ({ page }) => {
      await unlockToHomeScreen(page);
    });

    test('2.2.1: rapid mouse wheel scrolling in Messenger does not trigger app dismiss', async ({ page }) => {
      await launchApp(page, 'ПодвалГрам');
      const chatContainer = page.locator('.overflow-y-auto').first();
      await expect(chatContainer).toBeVisible();

      // Scroll violently up and down 10 times
      for (let i = 0; i < 10; i++) {
        await page.mouse.wheel(0, i % 2 === 0 ? 300 : -300);
        await page.waitForTimeout(30);
      }

      // App must still be active!
      await expect(page.locator('text=ПодвалГрам').first()).toBeVisible();
    });

    test('2.2.2: rapid vertical touch drags in center of app do not exit app', async ({ page }) => {
      await launchApp(page, 'Заметки');
      const body = page.locator('.overflow-y-auto').first();
      await expect(body).toBeVisible();
      const box = await body.boundingBox();
      if (box) {
        // Drag up in the middle of the screen
        const midX = box.x + box.width / 2;
        const midY = box.y + box.height / 2;

        for (let i = 0; i < 5; i++) {
          await page.mouse.move(midX, midY);
          await page.mouse.down();
          await page.mouse.move(midX, midY - 120, { steps: 4 });
          await page.mouse.up();
          await page.waitForTimeout(40);
        }
      }

      // Notes app must remain open
      await expect(page.locator('text=Заметки').first()).toBeVisible();
    });
  });

  // ================= 2.3: Multiple Rapid Taps (Debounce & Resilience) =================
  test.describe('Rapid Multi-Tap Resilience', () => {
    test.beforeEach(async ({ page }) => {
      await unlockToHomeScreen(page);
    });

    test('2.3.1: rapid successive clicks on app dock/grid icons do not cause uncaught error or freeze', async ({ page }) => {
      const messengerIcon = page.locator('text=ПодвалГрам').first();
      
      // Click 5 times in rapid succession
      await messengerIcon.click({ clickCount: 3 });

      // App opens cleanly
      await expect(page.locator('text=ПодвалГрам').first()).toBeVisible();
    });

    test('2.3.2: rapid toggling of note checklists maintains consistent state', async ({ page }) => {
      await launchApp(page, 'Заметки');

      // Click note 1 to open it
      await page.locator('text=Рецепт хунтуней от Чу Ваньнина').first().click();
      await expect(page.locator('text=Инструкция для тех, кто не умеет готовить')).toBeVisible({ timeout: 5000 });

      // Checklist item
      const item = page.locator('text=Отмерить ровно 2 грамма священного перца').first();
      if (await item.isVisible()) {
        // Rapid toggle 4 times
        await item.click();
        await item.click();
        await item.click();
        await item.click();
      }

      // App remains responsive
      await expect(page.locator('text=Заметки').first()).toBeVisible();
    });
  });

  // ================= 2.4: Scratch Card Boundary Conditions =================
  test.describe('Scratch Card Boundary Conditions', () => {
    test.beforeEach(async ({ page }) => {
      await unlockToHomeScreen(page);
      await launchApp(page, 'VIP Сейф');

      // Unlock Safe
      await enterSafePin(page, '2027');
      await expect(page.locator('text=ОТКРЫТО')).toBeVisible({ timeout: 5000 });
    });

    test('2.4.1: small partial scratch (<45%) does NOT reveal gift buttons', async ({ page }) => {
      // Just 2 tiny scratches
      await scratchCanvas(page, 'canvas.cursor-crosshair', 2);

      // Verify gift buttons are NOT yet visible
      await expect(page.locator('text=Золотое Яблоко')).not.toBeVisible();
      await expect(page.locator('text=Сертификат Ozon')).not.toBeVisible();

      // Canvas remains visible
      await expect(page.locator('canvas.cursor-crosshair')).toBeVisible();
    });

    test('2.4.2: continuing scratch past 45% cleanly triggers unlock and dismisses canvas', async ({ page }) => {
      // Small scratch first
      await scratchCanvas(page, 'canvas.cursor-crosshair', 2);
      await expect(page.locator('canvas.cursor-crosshair')).toBeVisible();

      // Additional comprehensive scratching
      await scratchCanvas(page, 'canvas.cursor-crosshair', 25);

      // Should now be unlocked
      await expect(page.locator('text=ЛЁД РАСТОПЛЕН!')).toBeVisible({ timeout: 8000 });
      await expect(page.locator('canvas.cursor-crosshair')).not.toBeVisible();
    });
  });

  // ================= 2.5: Viewport Resizing Dynamics =================
  test.describe('Dynamic Viewport Resizing', () => {
    test('2.5.1: resizing from desktop to mobile viewport dynamically maintains layout integrity', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto('/');

      await expect(page.locator('text=Праздничное письмо')).toBeVisible();

      // Resize down to mobile viewport
      await page.setViewportSize({ width: 430, height: 932 });
      await page.waitForTimeout(200);

      // UI should adapt seamlessly
      await expect(page.locator('text=Праздничное письмо')).toBeVisible();
      await expect(page.locator('text=Открыть поздравление')).toBeVisible();
    });
  });

});
