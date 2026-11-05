import { test, expect, Page } from '@playwright/test';
import { unlockToHomeScreen, launchApp } from './helpers';

async function indicatorCenter(page: Page) {
  const box = await page.locator('#ios-home-indicator').boundingBox();
  if (!box) throw new Error('Home indicator missing');
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

const closeSettings = (page: Page) => page.getByRole('button', { name: 'Закрыть настройки', exact: true });

test('mouse upward drag closes app after leaving indicator; short drag and cancellation do not', async ({ page }) => {
  await unlockToHomeScreen(page);
  await launchApp(page, 'Настройки');
  await expect(closeSettings(page)).toBeVisible();
  const { x, y } = await indicatorCenter(page);
  // A drag must work without falling back to the click handler.
  await page.evaluate(() => {
    const indicator = document.querySelector('#ios-home-indicator')!;
    const blockClick = (event: Event) => event.stopImmediatePropagation();
    indicator.addEventListener('click', blockClick, { capture: true });
    (window as any).unblockIndicatorClick = () => indicator.removeEventListener('click', blockClick, { capture: true });
  });
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x, y - 8, { steps: 4 });
  await page.mouse.up();
  await expect(closeSettings(page)).toBeVisible();
  await page.locator('#ios-home-indicator').dispatchEvent('pointercancel', { pointerId: 1, pointerType: 'mouse' });
  await expect(closeSettings(page)).toBeVisible();
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x, y - 100, { steps: 12 });
  await page.mouse.up();
  await expect(closeSettings(page)).not.toBeVisible();
  await expect(page.locator('[aria-label="Настройки"]').first()).toBeVisible();
  // Tap/click remains an alternative after the swipe's synthetic-click guard expires.
  await launchApp(page, 'Настройки');
  await page.evaluate(() => (window as any).unblockIndicatorClick());
  await page.waitForTimeout(450);
  await page.locator('#ios-home-indicator').click();
  await expect(closeSettings(page)).not.toBeVisible();
});

test('native touch upward swipe closes apps with compact and expanded music', async ({ page, context }, testInfo) => {
  test.skip(!testInfo.project.use.hasTouch, 'Requires the mobile touch profile');
  await unlockToHomeScreen(page);
  const session = await context.newCDPSession(page);
  try {
    for (const expanded of [false, true]) {
      if (expanded) await page.getByRole('button', { name: 'Открыть музыкальный плеер' }).click();
      await launchApp(page, 'Настройки');
      await expect(closeSettings(page)).toBeAttached();
      const { x, y } = await indicatorCenter(page);
      await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
      await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y - 70 }] });
      await session.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
      await expect(closeSettings(page)).toBeAttached();
      await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
      for (let step = 1; step <= 8; step++) {
        await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y - step * 12 }] });
      }
      await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await expect(closeSettings(page)).not.toBeAttached();
      await expect(page.locator('[aria-label="Настройки"]').first()).toBeVisible();
    }
  } finally {
    await session.detach();
  }
});
