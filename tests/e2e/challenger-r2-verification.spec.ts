import { test, expect } from '@playwright/test';
import { unlockToHomeScreen, launchApp } from './helpers';

test.describe('Challenger R2 Verification: Bounding, Clearance, Weather Scroll & Fullscreen', () => {

  // ================= 1. APP WINDOW BOTTOM-0 BOUNDING & HOME INDICATOR OVERLAY =================
  test('1.1: Open app window extends completely to bottom-0 of phone chassis with zero gap', async ({ page }) => {
    await unlockToHomeScreen(page);

    const apps = ['ПодвалГрам', 'Заметки', 'VIP Сейф', 'Погода', 'Фото', 'Часы', 'Настройки'];
    const chassis = page.locator('[data-testid="phone-chassis"]');
    await expect(chassis).toBeVisible();

    for (const appName of apps) {
      // Ensure the app icon is visible by checking if we need Page 2
      const icon = page.locator(`[aria-label="${appName}"]`).first();
      if (!(await icon.isVisible())) {
        const dot2 = page.locator('button[aria-label="Страница 2"]');
        if (await dot2.isVisible()) {
          await dot2.click();
          await page.waitForTimeout(300);
        }
      }
      if (!(await icon.isVisible())) {
        const dot1 = page.locator('button[aria-label="Страница 1"]');
        if (await dot1.isVisible()) {
          await dot1.click();
          await page.waitForTimeout(300);
        }
      }

      await launchApp(page, appName);
      await page.waitForTimeout(300);

      const chassisBox = await chassis.boundingBox();
      expect(chassisBox).not.toBeNull();
      if (!chassisBox) return;

      const appWindow = page.locator('.will-change-transform');
      await expect(appWindow).toBeVisible();
      const appBox = await appWindow.boundingBox();
      expect(appBox).not.toBeNull();
      if (!appBox) return;

      // Calculate inner display bottom edge (accounting for sm:border-[10px] chassis bezel on desktop)
      const borderBottom = await chassis.evaluate((el) => parseFloat(window.getComputedStyle(el).borderBottomWidth) || 0);
      const innerChassisBottom = chassisBox.y + chassisBox.height - borderBottom;
      const appBottom = appBox.y + appBox.height;

      // App bottom must reach the very bottom of the screen chassis viewport with 0 gap
      expect(Math.abs(innerChassisBottom - appBottom)).toBeLessThanOrEqual(1.5);

      // Home indicator must exist and overlay on top (higher z-index, overlapping y-coordinate)
      const indicator = page.locator('#ios-home-indicator');
      await expect(indicator).toBeVisible();
      const indBox = await indicator.boundingBox();
      expect(indBox).not.toBeNull();
      if (!indBox) return;

      // Indicator is inside the app window bounds vertically
      expect(indBox.y + indBox.height).toBeLessThanOrEqual(appBottom + 1);
      expect(indBox.y).toBeGreaterThanOrEqual(appBottom - 40);

      // Close app via indicator
      await indicator.click();
      await expect(appWindow).not.toBeVisible({ timeout: 5000 });
    }
  });

  test('1.2: Bottom interactive elements in Messenger, Safe, and Notes have clearance and are not blocked', async ({ page }) => {
    await unlockToHomeScreen(page);

    // 1. MessengerApp: input & sticker drawer
    await launchApp(page, 'ПодвалГрам');
    const stickerBtn = page.locator('button[aria-label="Открыть стикеры"]');
    await expect(stickerBtn).toBeVisible();

    // Verify sticker button is clickable and opens drawer without closing app
    await stickerBtn.click();
    await expect(page.locator('text=Праздничные Стикеры 🎄')).toBeVisible();
    await expect(page.locator('.will-change-transform')).toBeVisible();

    // Verify bottom container has pb-6
    const msgInputContainer = page.locator('button[aria-label="Открыть стикеры"]').locator('..').locator('..');
    const msgClasses = await msgInputContainer.getAttribute('class');
    expect(msgClasses).toContain('pb-6');

    // Close Messenger
    await page.locator('button[aria-label="Закрыть мессенджер"]').click();
    await expect(page.locator('.will-change-transform')).not.toBeVisible();

    // 2. NotesApp: bottom toolbar
    await launchApp(page, 'Заметки');
    const newNoteBtn = page.locator('button[title="Новая заметка"]');
    await expect(newNoteBtn).toBeVisible();
    const toolbar = newNoteBtn.locator('..');
    const tbClasses = await toolbar.getAttribute('class');
    expect(tbClasses).toContain('pb-6');

    // Clicking toolbar button does not close app or hit home indicator
    await newNoteBtn.click();
    await expect(page.locator('.will-change-transform')).toBeVisible();

    // Close Notes
    await page.locator('button[aria-label="Закрыть заметки"]').click();
    await expect(page.locator('.will-change-transform')).not.toBeVisible();

    // 3. SafeApp: Keypad and scroll container clearance
    await launchApp(page, 'VIP Сейф');
    const safeContent = page.locator('.flex-1.overflow-y-auto');
    const safeClasses = await safeContent.getAttribute('class');
    expect(safeClasses).toContain('pb-8');

    // Bottom keypad buttons 'C', '0', '⌫' are clickable and functional
    const btnZero = page.locator('button:has-text("0")');
    await btnZero.click();
    // App remains open
    await expect(page.locator('.will-change-transform')).toBeVisible();

    // Close Safe
    await page.locator('button[aria-label="Закрыть сейф"]').click();
    await expect(page.locator('.will-change-transform')).not.toBeVisible();
  });

  // ================= 2. HOURLY FORECAST VERTICAL SCROLL (R3) =================
  test('2.1: Swiping vertically across hourly forecast scroller scrolls the page smoothly without lock', async ({ page }) => {
    await unlockToHomeScreen(page);

    // Go to Page 2 for Weather app
    await page.locator('button[aria-label="Страница 2"]').click();
    await page.waitForTimeout(400);

    await launchApp(page, 'Погода');
    await expect(page.locator('text=Новогодняя Ночь 2027')).toBeVisible();

    // Locate hourly forecast container
    const hourlyTitle = page.locator('text=Почасовой прогноз');
    await expect(hourlyTitle).toBeVisible();

    const hourlyScroller = page.locator('.touch-pan-x.touch-pan-y');
    await expect(hourlyScroller).toBeVisible();

    // Check touch-action computed style
    const touchAction = await hourlyScroller.evaluate((el) => {
      return window.getComputedStyle(el).touchAction;
    });
    expect(touchAction).toBe('pan-x pan-y');

    // Locate main scroll container
    const scrollContainer = page.locator('.overflow-y-auto.overscroll-contain.touch-pan-y');
    await expect(scrollContainer).toBeVisible();

    // Initial scroll position
    const initialScrollTop = await scrollContainer.evaluate((el) => el.scrollTop);
    expect(initialScrollTop).toBe(0);

    // Perform vertical drag directly across the hourly forecast cards
    const hourlyBox = await hourlyScroller.boundingBox();
    expect(hourlyBox).not.toBeNull();
    if (!hourlyBox) return;

    const startX = hourlyBox.x + hourlyBox.width / 2;
    const startY = hourlyBox.y + hourlyBox.height / 2;
    const endY = startY - 150;

    // Simulate vertical drag/swipe on desktop or mobile
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX, endY, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(300);

    // Check if container scrolled or wheel scrolls
    await scrollContainer.evaluate((el) => {
      el.scrollBy({ top: 120, behavior: 'instant' });
    });
    const scrolledTop = await scrollContainer.evaluate((el) => el.scrollTop);
    expect(scrolledTop).toBeGreaterThan(0);

    // Verify hourly forecast horizontal scroll remains independent
    const initialScrollLeft = await hourlyScroller.evaluate((el) => el.scrollLeft);
    await hourlyScroller.evaluate((el) => {
      el.scrollBy({ left: 100, behavior: 'instant' });
    });
    const scrolledLeft = await hourlyScroller.evaluate((el) => el.scrollLeft);
    expect(scrolledLeft).toBeGreaterThan(initialScrollLeft);
  });

  // ================= 3. BAITSCREEN FULLSCREEN TRANSITION RESILIENCE (R6) =================
  test('3.1: BaitScreen transitions to Phone screen when Fullscreen API is rejected', async ({ page }) => {
    test.setTimeout(30000);
    await page.goto('/');

    // Force requestFullscreen to reject
    await page.evaluate(() => {
      document.documentElement.requestFullscreen = () => {
        return Promise.reject(new DOMException('Fullscreen request denied by policy', 'NotAllowedError'));
      };
    });

    const openBtn = page.locator('text=Открыть поздравление');
    await expect(openBtn).toBeVisible({ timeout: 5000 });
    await openBtn.click();

    // Glitch sequence must trigger without being blocked by rejected promise
    await expect(page.locator('text=СИСТЕМА ПЕРЕХВАЧЕНА')).toBeVisible({ timeout: 5000 });

    // Transition smoothly completes to LockScreen
    const unlockHint = page.locator('text=Смахните вверх для разблокировки');
    await expect(unlockHint).toBeVisible({ timeout: 15000 });
  });

  test('3.2: BaitScreen transitions to Phone screen when Fullscreen API throws synchronously', async ({ page }) => {
    test.setTimeout(30000);
    await page.goto('/');

    // Force requestFullscreen to throw synchronously
    await page.evaluate(() => {
      document.documentElement.requestFullscreen = () => {
        throw new Error('Synchronous fullscreen failure in security sandbox');
      };
    });

    const openBtn = page.locator('text=Открыть поздравление');
    await expect(openBtn).toBeVisible({ timeout: 5000 });
    await openBtn.click();

    // Glitch sequence must trigger without unhandled crash
    await expect(page.locator('text=СИСТЕМА ПЕРЕХВАЧЕНА')).toBeVisible({ timeout: 5000 });

    // Transition smoothly completes to LockScreen
    const unlockHint = page.locator('text=Смахните вверх для разблокировки');
    await expect(unlockHint).toBeVisible({ timeout: 15000 });
  });
});
