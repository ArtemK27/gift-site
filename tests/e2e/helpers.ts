import { Page, expect } from '@playwright/test';

/**
 * Navigates from BaitScreen to HomeScreen by opening gift, waiting for glitch sequence,
 * and unlocking the LockScreen.
 */
export async function unlockToHomeScreen(page: Page) {
  await page.goto('/');
  
  // Wait for BaitScreen
  const openButton = page.locator('text=Открыть поздравление');
  await expect(openButton).toBeVisible({ timeout: 10000 });
  await openButton.click();

  // Wait for LockScreen to appear (after glitch sequence ~2-3s)
  const unlockHint = page.locator('text=Смахните вверх для разблокировки');
  await expect(unlockHint).toBeVisible({ timeout: 15000 });

  // Click the unlock hint
  await unlockHint.click();

  // Wait for LockScreen to fully unmount
  await expect(unlockHint).not.toBeVisible({ timeout: 10000 });

  // Wait for HomeScreen (SpringBoard) apps to be visible and stable
  const homeApp = page.locator('[aria-label="ПодвалГрам"]').first();
  await expect(homeApp).toBeVisible({ timeout: 10000 });
}

/**
 * Opens an app from HomeScreen by clicking its icon.
 */
export async function launchApp(page: Page, appName: string) {
  const appIcon = page.locator(`[aria-label="${appName}"]`).first();
  await expect(appIcon).toBeVisible({ timeout: 5000 });
  await appIcon.click();
}

/**
 * Types a 4-digit PIN into the Safe numeric keypad with realistic pacing
 * to allow React state closures to update cleanly between strokes.
 */
export async function enterSafePin(page: Page, pin = '2027') {
  for (const digit of pin) {
    const btn = page.locator(`.grid button:has-text("${digit}")`).first();
    await btn.click();
    await page.waitForTimeout(100);
  }
}

/**
 * Simulates scratching the SafeApp HTML5 canvas element until threshold is met.
 * Targets the specific scratch canvas (.cursor-crosshair) rather than the global LiveWallpaper canvas.
 */
export async function scratchCanvas(page: Page, canvasSelector = 'canvas.cursor-crosshair', strokes = 25) {
  const canvas = page.locator(canvasSelector);
  await expect(canvas).toBeVisible({ timeout: 5000 });
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Scratch canvas bounding box not found');

  const startX = box.x + box.width * 0.15;
  const startY = box.y + box.height * 0.2;
  const width = box.width * 0.7;
  const height = box.height * 0.6;

  for (let i = 0; i < strokes; i++) {
    const y = startY + (i / strokes) * height;
    await page.mouse.move(startX, y);
    await page.mouse.down();
    await page.mouse.move(startX + width, y, { steps: 5 });
    await page.mouse.up();
    await page.waitForTimeout(60);
  }
}
