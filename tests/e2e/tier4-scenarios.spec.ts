import { test, expect } from '@playwright/test';
import { unlockToHomeScreen, launchApp, scratchCanvas, enterSafePin } from './helpers';

test.describe('Tier 4: Real-World Scenarios', () => {

  // ================= SCENARIO 1: Complete Quest Walkthrough =================
  test('Scenario 1: Complete Quest Walkthrough from BaitScreen to SafeApp Scratch Card & Promo Code', async ({ page }) => {
    test.setTimeout(60000);
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('response', response => {
      if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
    });
    const failedRequests: string[] = [];
    page.on('requestfailed', request => {
      failedRequests.push(`${request.failure()?.errorText ?? 'unknown'} ${request.url()}`);
    });
    // 1. BaitScreen
    await page.goto('/');
    await page.screenshot({ path: test.info().outputPath('01-card.png') });
    await expect(page.locator('text=Праздничное письмо')).toBeVisible({ timeout: 10000 });
    const openBtn = page.locator('text=Открыть поздравление');
    await openBtn.click();

    // 2. Glitch Sequence
    await expect(page.locator('text=СИСТЕМА ПЕРЕХВАЧЕНА')).toBeVisible({ timeout: 5000 });

    // 3. LockScreen
    const unlockHint = page.locator('text=Смахните вверх для разблокировки');
    await expect(unlockHint).toBeVisible({ timeout: 15000 });
    await unlockHint.click();

    // 4. SpringBoard (HomeScreen)
    await expect(page.locator('text=ПодвалГрам').first()).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: test.info().outputPath('02-home.png') });
    // 5. MessengerApp Clue Investigation
    await launchApp(page, 'ПодвалГрам');
    await page.getByRole('button', { name: 'Открыть чат Новогодний Комитет 🎄' }).click();
    await expect(page.locator('text=Мандарины кто-нибудь взял?').first()).toBeVisible();

    // Wait for sticker clue or reaction in chat
    const stickerTrigger = page.locator('button[aria-label="Открыть стикеры"]');
    if (await stickerTrigger.isVisible()) {
      await stickerTrigger.click();
      // Click first sticker
      const sticker = page.locator('text=Сану & Пряник').first();
      if (await sticker.isVisible()) {
        await sticker.click();
      }
    }

    // Wait for Sangwoo's clue "20"
    await expect(page.locator('text=Первые две цифры от Сейфа — «20»')).toBeVisible({ timeout: 10000 });

    // Exit MessengerApp
    await page.locator('#ios-home-indicator').click();
    await expect(page.locator('text=Квест Сейфа')).toBeVisible({ timeout: 5000 });

    // 6. NotesApp Clue Investigation
    await launchApp(page, 'Заметки');
    await expect(page.locator('text=🥟 Рецепт хунтуней от Чу Ваньнина')).toBeVisible();

    // Open first note (contains clue 2)
    await page.locator('text=🥟 Рецепт хунтуней от Чу Ваньнина').click();
    await expect(page.locator('text=цифра «2»')).toBeVisible();

    // Back to notes list
    await page.locator('button[aria-label="Назад к списку"]').click();

    // Open second note (contains clue 7)
    await page.locator('text=🦇 Новогодний райдер Kai Angel & 9mice').click();
    await expect(page.locator('text=2 + 7 = «27» для Сейфа!')).toBeVisible();

    // Exit NotesApp to SpringBoard
    await page.locator('#ios-home-indicator').click();
    await expect(page.locator('text=Квест Сейфа')).toBeVisible({ timeout: 5000 });

    // 7. SafeApp Unlocking (PIN 2027)
    await launchApp(page, 'VIP Сейф');
    await expect(page.locator('text=VIP Сейф 2027')).toBeVisible();
    await expect(page.locator('text=ЗАКРЫТО')).toBeVisible();

    // Enter full PIN: 2 0 2 7
    await enterSafePin(page, '2027');

    // Safe opens to VIP PASS
    await expect(page.locator('text=ОТКРЫТО')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=VIP PASS 2027')).toBeVisible();
    await expect(page.locator('canvas.cursor-crosshair')).toBeVisible();

    // 8. Scratch Card (>45%)
    await scratchCanvas(page, 'canvas.cursor-crosshair', 25);
    await expect(page.locator('text=ЛЁД РАСТОПЛЕН!')).toBeVisible({ timeout: 8000 });

    // 9. Choose Gift (Золотое Яблоко)
    const goldAppleBtn = page.locator('text=Золотое Яблоко');
    await expect(goldAppleBtn).toBeVisible();
    await goldAppleBtn.click();

    // 10. Final Celebration Modal with Promo Code
    await expect(page.locator('text=Подарок твой! 🎄✨')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=GOLDEN-APPLE-NY2027')).toBeVisible();
    await page.screenshot({ path: test.info().outputPath('03-gift.png') });
    expect(errors, `Console, page and HTTP errors during complete quest; failed requests: ${failedRequests.join(' | ') || 'none'}`).toEqual([]);

    // 11. Copy Promo Code
    const copyBtn = page.locator('button:has(.lucide-copy), button:has(.lucide-check)').first();
    if (await copyBtn.isVisible()) {
      await copyBtn.click();
    }

    // 12. Return to Smartphone
    await page.locator('text=Вернуться в смартфон ✨').click();
    await expect(page.locator('text=Подарок твой! 🎄✨')).not.toBeVisible();
  });

  // ================= SCENARIO 2: Gesture Robustness =================
  test('Scenario 2: Gesture Robustness under high interaction frequency', async ({ page }) => {
    await unlockToHomeScreen(page);

    // Launch Messenger
    await launchApp(page, 'ПодвалГрам');
    await expect(page.locator('text=ПодвалГрам').first()).toBeVisible();

    // Simulate aggressive scrolling inside chat
    const chatContainer = page.locator('.overflow-y-auto').first();
    for (let i = 0; i < 8; i++) {
      await chatContainer.hover();
      await page.mouse.wheel(0, i % 2 === 0 ? 250 : -250);
      await page.waitForTimeout(20);
    }

    // App must remain open!
    await expect(page.locator('text=ПодвалГрам').first()).toBeVisible();

    // Exit cleanly via Home Indicator
    await page.locator('#ios-home-indicator').click();
    await expect(page.locator('text=Квест Сейфа')).toBeVisible({ timeout: 5000 });

    // Launch NotesApp
    await launchApp(page, 'Заметки');
    await expect(page.locator('text=Заметки').first()).toBeVisible();

    // Click note
    await page.locator('text=🥟 Рецепт хунтуней от Чу Ваньнина').click();

    // Exit cleanly via back button
    await page.locator('button[aria-label="Назад к списку"]').click();
    await expect(page.locator('text=🥟 Рецепт хунтуней от Чу Ваньнина')).toBeVisible();

    // Exit NotesApp via Home Indicator
    await page.locator('#ios-home-indicator').click();
    await expect(page.locator('text=Квест Сейфа')).toBeVisible({ timeout: 5000 });
  });

  // ================= SCENARIO 3: Viewport Responsiveness =================
  test('Scenario 3: Viewport Responsiveness at Mobile vs Desktop', async ({ page }) => {
    // Check current viewport
    const viewport = page.viewportSize();
    if (!viewport) return;

    await page.goto('/');

    if (viewport.width <= 640) {
      // Mobile: Fullscreen edge-to-edge
      const shell = page.locator('.h-\\[100dvh\\]').first();
      await expect(shell).toBeVisible();
    } else {
      // Desktop: Centered iPhone frame mockup
      const desktopBezel = page.locator('.sm\\:rounded-\\[56px\\]').first();
      await expect(desktopBezel).toBeVisible();
    }
  });

});
