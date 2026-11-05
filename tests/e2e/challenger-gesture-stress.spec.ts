import { test, expect } from '@playwright/test';
import { unlockToHomeScreen, launchApp, enterSafePin } from './helpers';

test.describe('Adversarial Gesture & Touch Isolation Stress Suite', () => {

  test.beforeEach(async ({ page }) => {
    await unlockToHomeScreen(page);
  });

  // ================= 1. GESTURE TOUCH ISOLATION =================
  test('1.1: Aggressive scrolling/dragging inside Messenger NEVER triggers exit or scale-down', async ({ page }) => {
    await launchApp(page, 'ПодвалГрам');
    await expect(page.locator('text=ПодвалГрам').first()).toBeVisible();
    await expect(page.locator('.will-change-transform')).toBeVisible();

    const chatContainer = page.locator('.overflow-y-auto').first();
    const box = await chatContainer.boundingBox();
    expect(box).not.toBeNull();
    if (!box) return;

    // Perform 10 intense swipe gestures inside chat history
    for (let i = 0; i < 10; i++) {
      const startY = box.y + box.height * 0.7;
      const endY = box.y + box.height * 0.2;
      const midX = box.x + box.width * 0.5;

      await page.mouse.move(midX, startY);
      await page.mouse.down();
      await page.mouse.move(midX, endY, { steps: 5 });
      await page.mouse.up();
      await page.waitForTimeout(30);
    }

    // App must remain open and mounted
    await expect(page.locator('text=ПодвалГрам').first()).toBeVisible();
    await expect(page.locator('.will-change-transform')).toBeVisible();
  });

  test('1.2: Aggressive scrolling/dragging inside Notes checklist/text NEVER triggers exit or scale-down', async ({ page }) => {
    await launchApp(page, 'Заметки');
    await expect(page.locator('text=Заметки').first()).toBeVisible();
    await expect(page.locator('.will-change-transform')).toBeVisible();

    const notesContainer = page.locator('.overflow-y-auto').first();
    const box = await notesContainer.boundingBox();
    expect(box).not.toBeNull();
    if (!box) return;

    // Upward drag in the middle of notes list
    for (let i = 0; i < 8; i++) {
      const startY = box.y + box.height * 0.8;
      const endY = box.y + box.height * 0.3;
      const midX = box.x + box.width * 0.5;

      await page.mouse.move(midX, startY);
      await page.mouse.down();
      await page.mouse.move(midX, endY, { steps: 5 });
      await page.mouse.up();
      await page.waitForTimeout(30);
    }

    await expect(page.locator('text=Заметки').first()).toBeVisible();
    await expect(page.locator('.will-change-transform')).toBeVisible();
  });

  test('1.3: Aggressive scrolling/dragging inside Gallery photo grid NEVER triggers exit or scale-down', async ({ page }) => {
    await launchApp(page, 'Фото');
    await expect(page.locator('text=Новогодний Альбом').first()).toBeVisible();
    await expect(page.locator('.will-change-transform')).toBeVisible();

    const galleryContainer = page.locator('.overflow-y-auto').first();
    const box = await galleryContainer.boundingBox();
    expect(box).not.toBeNull();
    if (!box) return;

    for (let i = 0; i < 8; i++) {
      const startY = box.y + box.height * 0.8;
      const endY = box.y + box.height * 0.3;
      const midX = box.x + box.width * 0.5;

      await page.mouse.move(midX, startY);
      await page.mouse.down();
      await page.mouse.move(midX, endY, { steps: 5 });
      await page.mouse.up();
      await page.waitForTimeout(30);
    }

    await expect(page.locator('text=Новогодний Альбом').first()).toBeVisible();
    await expect(page.locator('.will-change-transform')).toBeVisible();
  });

  test('1.4: Scratching SafeApp ice layer in all directions NEVER triggers exit or scale-down', async ({ page }) => {
    await launchApp(page, 'VIP Сейф');
    await enterSafePin(page, '2027');
    await expect(page.locator('text=ОТКРЫТО')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.will-change-transform')).toBeVisible();

    const canvas = page.locator('canvas.cursor-crosshair');
    await expect(canvas).toBeVisible();
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    if (!box) return;

    // Perform erratic scratching: zigzags, vertical swipes, diagonal strokes
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;

    for (let stroke = 0; stroke < 15; stroke++) {
      const fromX = cx + (Math.random() - 0.5) * box.width * 0.7;
      const fromY = cy + (Math.random() - 0.5) * box.height * 0.6;
      const toX = cx + (Math.random() - 0.5) * box.width * 0.7;
      const toY = cy - box.height * 0.3;

      await page.mouse.move(fromX, fromY);
      await page.mouse.down();
      await page.mouse.move(toX, toY, { steps: 5 });
      await page.mouse.up();
      await page.waitForTimeout(20);
    }

    // SafeApp must remain open
    await expect(page.locator('text=VIP Сейф 2027')).toBeVisible();
    await expect(page.locator('.will-change-transform')).toBeVisible();
  });

  // ================= 2. HOME INDICATOR GESTURE SPECIFICITY =================
  test('2.1: Swipes outside the Home Indicator do NOT trigger exit', async ({ page }) => {
    await launchApp(page, 'ПодвалГрам');
    await expect(page.locator('text=ПодвалГрам').first()).toBeVisible();
    await expect(page.locator('.will-change-transform')).toBeVisible();

    const indicator = page.locator('#ios-home-indicator');
    const indBox = await indicator.boundingBox();
    expect(indBox).not.toBeNull();
    if (!indBox) return;

    // Start 60px ABOVE the indicator (in the app area)
    const startY = indBox.y - 60;
    const endY = startY - 120;
    const midX = indBox.x + indBox.width / 2;

    await page.mouse.move(midX, startY);
    await page.mouse.down();
    await page.mouse.move(midX, endY, { steps: 5 });
    await page.mouse.up();
    await page.waitForTimeout(200);

    // App must remain open
    await expect(page.locator('text=ПодвалГрам').first()).toBeVisible();
    await expect(page.locator('.will-change-transform')).toBeVisible();
  });

  test('2.2: Swiping up strictly from #ios-home-indicator triggers exit to HomeScreen', async ({ page }) => {
    await launchApp(page, 'ПодвалГрам');
    await expect(page.locator('text=ПодвалГрам').first()).toBeVisible();
    await expect(page.locator('.will-change-transform')).toBeVisible();

    const indicator = page.locator('#ios-home-indicator');
    const indBox = await indicator.boundingBox();
    expect(indBox).not.toBeNull();
    if (!indBox) return;

    const startY = indBox.y + indBox.height / 2;
    const endY = startY - 60;
    const midX = indBox.x + indBox.width / 2;

    // Test touch swipe on mobile or pointer drag on desktop
    const isMobile = page.viewportSize()?.width === 430;
    if (isMobile) {
      await page.evaluate(({ startY, endY, midX }) => {
        const el = document.getElementById('ios-home-indicator')!;
        const touch1 = new Touch({ identifier: 1, target: el, clientY: startY, clientX: midX });
        const touch2 = new Touch({ identifier: 1, target: el, clientY: endY, clientX: midX });
        el.dispatchEvent(new TouchEvent('touchstart', { touches: [touch1], changedTouches: [touch1], bubbles: true }));
        el.dispatchEvent(new TouchEvent('touchend', { touches: [], changedTouches: [touch2], bubbles: true }));
      }, { startY, endY, midX });
    } else {
      await indicator.dispatchEvent('pointerdown', {
        pointerType: 'mouse',
        clientY: startY,
        clientX: midX,
      });
      await page.waitForTimeout(50);
      await indicator.dispatchEvent('pointerup', {
        pointerType: 'mouse',
        clientY: endY,
        clientX: midX,
      });
    }

    // App should smoothly exit to HomeScreen
    await expect(page.locator('.will-change-transform')).not.toBeVisible({ timeout: 5000 });
  });

  test('2.3: Tapping #ios-home-indicator triggers exit to HomeScreen', async ({ page }) => {
    await launchApp(page, 'Заметки');
    await expect(page.locator('text=Заметки').first()).toBeVisible();
    await expect(page.locator('.will-change-transform')).toBeVisible();

    const indicator = page.locator('#ios-home-indicator');
    await indicator.click();

    await expect(page.locator('.will-change-transform')).not.toBeVisible({ timeout: 5000 });
  });

  // ================= 3. SINGLE AUTHORITATIVE HOME INDICATOR =================
  test('3.1: Exactly ONE #ios-home-indicator exists across all screens and no dual bars exist', async ({ page }) => {
    // HomeScreen state
    expect(await page.locator('#ios-home-indicator').count()).toBe(1);
    expect(await page.locator('#dismiss-app-bar').count()).toBe(0);

    const appsToTest = ['ПодвалГрам', 'Заметки', 'Фото', 'VIP Сейф', 'Настройки', 'Часы', 'Погода'];

    for (const appName of appsToTest) {
      await launchApp(page, appName);
      await page.waitForTimeout(200);

      // Verify exactly 1 authoritative home indicator
      expect(await page.locator('#ios-home-indicator').count()).toBe(1);
      // Verify no duplicate dismiss bar
      expect(await page.locator('#dismiss-app-bar').count()).toBe(0);

      // Verify the home indicator attributes
      const indicator = page.locator('#ios-home-indicator');
      const classAttr = await indicator.getAttribute('class');
      expect(classAttr).toContain('touch-none');
      expect(classAttr).toContain('pointer-events-auto');
      expect(classAttr).toContain('z-50');

      // Close app via indicator click
      await indicator.click();
      await expect(page.locator('.will-change-transform')).not.toBeVisible({ timeout: 5000 });
    }
  });

  // ================= 4. TOP NAVIGATION EXIT BUTTONS =================
  test('4.1: Top navigation exit buttons (X and ChevronLeft) cleanly close every app', async ({ page }) => {
    // 1. MessengerApp X button
    await launchApp(page, 'ПодвалГрам');
    const msgClose = page.locator('button[aria-label="Закрыть мессенджер"]');
    await expect(msgClose).toBeVisible();
    await msgClose.click();
    await expect(page.locator('.will-change-transform')).not.toBeVisible({ timeout: 5000 });

    // 2. NotesApp X button
    await launchApp(page, 'Заметки');
    const notesClose = page.locator('button[aria-label="Закрыть заметки"]');
    await expect(notesClose).toBeVisible();
    await notesClose.click();
    await expect(page.locator('.will-change-transform')).not.toBeVisible({ timeout: 5000 });

    // 3. NotesApp ChevronLeft button (from root view)
    await launchApp(page, 'Заметки');
    const notesChevron = page.locator('button:has-text("Папки")');
    await expect(notesChevron).toBeVisible();
    await notesChevron.click();
    await expect(page.locator('.will-change-transform')).not.toBeVisible({ timeout: 5000 });

    // 4. GalleryApp X button
    await launchApp(page, 'Фото');
    const galleryClose = page.locator('button[aria-label="Закрыть фото"]');
    await expect(galleryClose).toBeVisible();
    await galleryClose.click();
    await expect(page.locator('.will-change-transform')).not.toBeVisible({ timeout: 5000 });

    // 5. GalleryApp ChevronLeft button
    await launchApp(page, 'Фото');
    const galleryChevron = page.locator('button:has-text("Альбомы")');
    await expect(galleryChevron).toBeVisible();
    await galleryChevron.click();
    await expect(page.locator('.will-change-transform')).not.toBeVisible({ timeout: 5000 });

    // 6. SafeApp X button
    await launchApp(page, 'VIP Сейф');
    const safeClose = page.locator('button[aria-label="Закрыть сейф"]');
    await expect(safeClose).toBeVisible();
    await safeClose.click();
    await expect(page.locator('.will-change-transform')).not.toBeVisible({ timeout: 5000 });

    // 7. SafeApp ChevronLeft button
    await launchApp(page, 'VIP Сейф');
    const safeChevron = page.locator('button[aria-label="Назад из Сейфа"]');
    await expect(safeChevron).toBeVisible();
    await safeChevron.click();
    await expect(page.locator('.will-change-transform')).not.toBeVisible({ timeout: 5000 });

    // 8. SettingsApp X button
    await launchApp(page, 'Настройки');
    const settingsClose = page.locator('button[aria-label="Закрыть настройки"]');
    await expect(settingsClose).toBeVisible();
    await settingsClose.click();
    await expect(page.locator('.will-change-transform')).not.toBeVisible({ timeout: 5000 });

    // 9. ClockApp X button
    await launchApp(page, 'Часы');
    const clockClose = page.locator('button[aria-label="Закрыть часы"]');
    await expect(clockClose).toBeVisible();
    await clockClose.click();
    await expect(page.locator('.will-change-transform')).not.toBeVisible({ timeout: 5000 });

    // 10. WeatherApp X button
    await launchApp(page, 'Погода');
    const weatherClose = page.locator('button[aria-label="Закрыть погоду"]');
    await expect(weatherClose).toBeVisible();
    await weatherClose.click();
    await expect(page.locator('.will-change-transform')).not.toBeVisible({ timeout: 5000 });
  });

  // ================= 5. SPRING EXIT MOTION PHYSICS =================
  test('5.1: Spring exit animation wrapper has composited transform properties and clean exit transition', async ({ page }) => {
    await launchApp(page, 'ПодвалГрам');
    await expect(page.locator('text=ПодвалГрам').first()).toBeVisible();

    // Verify AppWindow wrapper classes: will-change-transform (bottom-0 layout)
    const appWrapper = page.locator('.will-change-transform');
    await expect(appWrapper).toBeVisible();
    const classList = await appWrapper.getAttribute('class');
    expect(classList).toContain('will-change-transform');

    // Click Home indicator to trigger spring exit
    const indicator = page.locator('#ios-home-indicator');
    await indicator.click();

    // App should smoothly transition out and unmount
    await expect(appWrapper).not.toBeVisible({ timeout: 5000 });
  });
});
