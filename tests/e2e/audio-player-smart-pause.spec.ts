import { test, expect } from '@playwright/test';
import { unlockToHomeScreen } from './helpers';

test.describe('R2 & R5: Audio Player in Dynamic Island & Smart Tab Auto-Pause', () => {

  test('audio assets and cover images are accessible via relative paths without 404', async ({ page }) => {
    await page.goto('./');

    const assetsToCheck = [
      './assets/audio/viperr-heavy-metal.mp3',
      './assets/audio/sangwoo-lullaby.mp3',
      './assets/audio/erha-snow-melody.mp3',
      './assets/cover-viperr.jpg',
      './assets/cover-sangwoo.jpg',
      './assets/cover-erha.jpg',
    ];

    for (const asset of assetsToCheck) {
      const response = await page.request.get(asset);
      expect(response.status(), `Asset ${asset} should return HTTP 200/206`).toBe(200);
      const buffer = await response.body();
      expect(buffer.length, `Asset ${asset} should not be empty`).toBeGreaterThan(1000);
    }
  });

  test('dynamic island expands, displays covers, and transport controls isolate click events', async ({ page }) => {
    await unlockToHomeScreen(page);

    const islandPill = page.getByRole('button', { name: 'Открыть музыкальный плеер' });
    await expect(islandPill).toBeVisible();

    // Click to expand
    await islandPill.click();

    // Verify collapse button is visible
    const collapseBtn = page.getByTitle('Свернуть', { exact: true });
    await expect(collapseBtn).toBeVisible();

    // Verify first track metadata
    await expect(page.locator('text=VIPERR (Kai Angel & 9mice)')).toBeVisible();
    await expect(page.locator('text=Heavy Metal New Year').first()).toBeVisible();

    // Verify transport buttons
    const prevBtn = page.getByRole('button', { name: 'Предыдущий трек' });
    const nextBtn = page.getByRole('button', { name: 'Следующий трек' });
    const playPauseBtn = page.getByRole('button', { name: 'Приостановить музыку' });

    await expect(prevBtn).toBeVisible();
    await expect(nextBtn).toBeVisible();
    await expect(playPauseBtn).toBeVisible();

    // Click Next track - should switch to Track 2 (Killing Stalking) WITHOUT collapsing island
    await nextBtn.click();
    await expect(collapseBtn).toBeVisible(); // Island MUST stay open
    await expect(page.locator('text=О Сану (Killing Stalking)')).toBeVisible();
    await expect(page.locator('text=Midnight Penthouse').first()).toBeVisible();

    // Click Next track again - should switch to Track 3 (Erha) WITHOUT collapsing island
    await nextBtn.click();
    await expect(collapseBtn).toBeVisible();
    await expect(page.locator('text=Чу Ваньнин & Мо Жань (Erha)')).toBeVisible();
    await expect(page.locator('text=Snow at Sisheng Peak').first()).toBeVisible();

    // Click Prev track - should switch back to Track 2
    await prevBtn.click();
    await expect(collapseBtn).toBeVisible();
    await expect(page.locator('text=О Сану (Killing Stalking)')).toBeVisible();

    // Click Play/Pause - should pause playback WITHOUT collapsing island
    await playPauseBtn.click();
    await expect(collapseBtn).toBeVisible();
    await expect(page.getByRole('button', { name: 'Включить музыку' })).toBeVisible();

    // Click Play/Pause again - should resume
    await page.getByRole('button', { name: 'Включить музыку' }).click();
    await expect(collapseBtn).toBeVisible();
    await expect(page.getByRole('button', { name: 'Приостановить музыку' })).toBeVisible();

    // Collapse via collapse button
    await collapseBtn.click();
    await expect(page.getByRole('button', { name: 'Открыть музыкальный плеер' })).toBeVisible();

    // Re-open and collapse via Escape key
    await page.getByRole('button', { name: 'Открыть музыкальный плеер' }).click();
    await expect(page.getByTitle('Свернуть', { exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Открыть музыкальный плеер' })).toBeVisible();
  });

  test('R5: Smart tab visibility auto-pauses when tab hidden and resumes only if was playing', async ({ page }) => {
    await unlockToHomeScreen(page);

    // Expand player
    await page.getByRole('button', { name: 'Открыть музыкальный плеер' }).click();
    await expect(page.getByTitle('Свернуть', { exact: true })).toBeVisible();

    // Verify initial playing state
    await expect(page.getByRole('button', { name: 'Приостановить музыку' })).toBeVisible();

    // 1. Simulate tab switch (hidden = true)
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    // Audio should be paused: "Включить музыку" button appears
    await expect(page.getByRole('button', { name: 'Включить музыку' })).toBeVisible();

    // 2. Simulate return to tab (hidden = false)
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    // Audio should automatically resume because it was playing before hidden
    await expect(page.getByRole('button', { name: 'Приостановить музыку' })).toBeVisible();

    // 3. User manually pauses music
    await page.getByRole('button', { name: 'Приостановить музыку' }).click();
    await expect(page.getByRole('button', { name: 'Включить музыку' })).toBeVisible();

    // 4. Simulate tab switch again while paused
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await expect(page.getByRole('button', { name: 'Включить музыку' })).toBeVisible();

    // 5. Simulate return to tab again
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    // Audio MUST REMAIN PAUSED! "Включить музыку" should still be visible
    await expect(page.getByRole('button', { name: 'Включить музыку' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Приостановить музыку' })).not.toBeVisible();
  });

});
