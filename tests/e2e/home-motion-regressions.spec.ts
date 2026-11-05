import { test, expect, Page } from '@playwright/test';
import { unlockToHomeScreen, launchApp } from './helpers';

async function position(page: Page) {
  return page.getByTestId('home-pages').evaluate(el => new DOMMatrixReadOnly(getComputedStyle(el).transform).m41);
}

async function swipe(page: Page, direction: 'left' | 'right', distance = 120) {
  const area = page.getByTestId('home-pages');
  const box = await area.boundingBox();
  if (!box) throw new Error('Home pages missing');
  const viewport = page.viewportSize()!;
  const start = direction === 'left' ? viewport.width / 2 + 60 : viewport.width / 2 - 60;
  const y = box.y + box.height * 0.5;
  await page.mouse.move(start, y);
  await page.mouse.down();
  await page.mouse.move(start + (direction === 'left' ? -distance : distance), y, { steps: 12 });
  // Pause to remove release velocity: the animation must still settle smoothly.
  await page.waitForTimeout(120);
}

test('swipe follows the finger and settles through intermediate frames in both directions', async ({ page }) => {
  await unlockToHomeScreen(page);
  const width = await page.getByTestId('home-pages').evaluate(el => el.clientWidth);
  await swipe(page, 'left');
  const held = await position(page);
  expect(held).toBeLessThan(-80);
  expect(held).toBeGreaterThan(-170);
  await page.mouse.up();
  await page.waitForTimeout(70);
  const middle = await position(page);
  expect(middle).toBeLessThan(held - 10);
  expect(middle).toBeGreaterThan(-width + 5);
  await expect.poll(() => position(page)).toBeCloseTo(-width, 0);
  await swipe(page, 'right');
  const heldRight = await position(page);
  expect(heldRight).toBeGreaterThan(-width + 80);
  await page.mouse.up();
  await page.waitForTimeout(70);
  const middleRight = await position(page);
  expect(middleRight).toBeGreaterThan(heldRight + 10);
  expect(middleRight).toBeLessThan(-5);
  await expect.poll(() => position(page)).toBeCloseTo(0, 0);
});

test('short drag snaps back; dots and viewport resize retain the selected page', async ({ page }) => {
  await unlockToHomeScreen(page);
  await swipe(page, 'left', 20);
  await page.mouse.up();
  await expect.poll(() => position(page)).toBeCloseTo(0, 0);
  await page.getByRole('button', { name: 'Страница 2' }).click();
  await expect.poll(async () => Math.abs((await position(page)) + await page.getByTestId('home-pages').evaluate(el => el.clientWidth))).toBeLessThan(1);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(() => position(page)).toBeCloseTo(-390, 0);
});

test('music remains visible and operable after app exits with expanded and compact player', async ({ page }) => {
  await unlockToHomeScreen(page);
  const island = page.getByTestId('dynamic-island');
  for (const expanded of [false, true]) {
    if (expanded) await page.getByRole('button', { name: 'Открыть музыкальный плеер' }).click();
    for (const [name, close] of [['Настройки', 'Закрыть настройки'], ['ПодвалГрам', 'Закрыть мессенджер'], ['VIP Сейф', 'Закрыть сейф']]) {
      await launchApp(page, name);
      if (name === 'ПодвалГрам') await page.waitForTimeout(3800);
      await page.getByRole('button', { name: close, exact: true }).click();
      await expect(island).toBeInViewport({ ratio: 1 });
      await expect.poll(() => island.evaluate(el => {
        const r = el.getBoundingClientRect();
        return el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));
      })).toBe(true);
    }
    if (!expanded) await page.getByRole('button', { name: 'Открыть музыкальный плеер' }).click();
    await page.getByRole('button', { name: 'Приостановить музыку' }).click();
    await expect(page.getByRole('button', { name: 'Включить музыку' })).toBeVisible();
    await page.getByRole('button', { name: 'Включить музыку' }).click();
    await page.getByTitle('Свернуть', { exact: true }).click();
    await expect(page.getByRole('button', { name: 'Открыть музыкальный плеер' })).toBeVisible();
  }
});
