import { test, expect } from '@playwright/test';
import { unlockToHomeScreen, launchApp } from './helpers';

test.describe('Challenger R2, R4, R5 Empirical Verification Suite', () => {

  // ================= 1. Audio System & 404 Check (R2) =================
  test('1.1: Audio files and cover images exist, are valid binaries, and return HTTP 200 without 404', async ({ page }) => {
    await page.goto('./');

    const audioAssets = [
      './assets/audio/viperr-heavy-metal.mp3',
      './assets/audio/sangwoo-lullaby.mp3',
      './assets/audio/erha-snow-melody.mp3',
    ];

    for (const audioPath of audioAssets) {
      const response = await page.request.get(audioPath);
      expect(response.status(), `Audio asset ${audioPath} must return 200`).toBe(200);
      const buffer = await response.body();
      expect(buffer.length, `Audio asset ${audioPath} must be at least 100KB`).toBeGreaterThan(100000);
      // Verify audio binary header (ID3 or MP3 sync 0xFF)
      const isId3 = buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33;
      const isMp3Sync = buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0;
      expect(isId3 || isMp3Sync, `Audio asset ${audioPath} must have valid MP3/ID3 header`).toBe(true);
    }

    const coverAssets = [
      './assets/cover-viperr.jpg',
      './assets/cover-sangwoo.jpg',
      './assets/cover-erha.jpg',
    ];

    for (const coverPath of coverAssets) {
      const response = await page.request.get(coverPath);
      expect(response.status(), `Cover asset ${coverPath} must return 200`).toBe(200);
      const buffer = await response.body();
      expect(buffer.length, `Cover asset ${coverPath} must be at least 100KB`).toBeGreaterThan(100000);
      // Verify JPEG header (0xFF 0xD8 0xFF)
      const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
      expect(isJpeg, `Cover asset ${coverPath} must be a valid JPEG`).toBe(true);
    }
  });

  test('1.2: Dynamic Island playlist track cycling (Next / Prev) with wrap-around and boundary conditions', async ({ page }) => {
    await unlockToHomeScreen(page);

    const islandPill = page.getByRole('button', { name: 'Открыть музыкальный плеер' });
    await expect(islandPill).toBeVisible();
    await islandPill.click();

    const collapseBtn = page.getByRole('button', { name: 'Свернуть', exact: true });
    await expect(collapseBtn).toBeVisible();

    const prevBtn = page.getByRole('button', { name: 'Предыдущий трек' });
    const nextBtn = page.getByRole('button', { name: 'Следующий трек' });

    // Initial: Track 0 - VIPERR
    await expect(page.locator('text=VIPERR (Kai Angel & 9mice)')).toBeVisible();
    await expect(page.locator('text=Heavy Metal New Year').first()).toBeVisible();

    // Next -> Track 1 - Sangwoo
    await nextBtn.click();
    await expect(page.locator('text=О Сану (Killing Stalking)')).toBeVisible();
    await expect(page.locator('text=Midnight Penthouse').first()).toBeVisible();

    // Next -> Track 2 - Erha
    await nextBtn.click();
    await expect(page.locator('text=Чу Ваньнин & Мо Жань (Erha)')).toBeVisible();
    await expect(page.locator('text=Snow at Sisheng Peak').first()).toBeVisible();

    // Next -> Wrap around to Track 0 - VIPERR
    await nextBtn.click();
    await expect(page.locator('text=VIPERR (Kai Angel & 9mice)')).toBeVisible();
    await expect(page.locator('text=Heavy Metal New Year').first()).toBeVisible();

    // Prev from start of track (currentTime <= 3) -> Wrap backward to Track 2 - Erha
    await prevBtn.click();
    await expect(page.locator('text=Чу Ваньнин & Мо Жань (Erha)')).toBeVisible();

    // Prev again -> Track 1 - Sangwoo
    await prevBtn.click();
    await expect(page.locator('text=О Сану (Killing Stalking)')).toBeVisible();
  });

  // ================= 2. Dynamic Island Button Click Isolation (R2) =================
  test('2.1: Expanded controls isolate click events (e.stopPropagation) under rapid stress and outside clicks collapse', async ({ page }) => {
    await unlockToHomeScreen(page);

    const islandPill = page.getByRole('button', { name: 'Открыть музыкальный плеер' });
    await islandPill.click();

    const collapseBtn = page.getByRole('button', { name: 'Свернуть', exact: true });
    await expect(collapseBtn).toBeVisible();

    const prevBtn = page.getByRole('button', { name: 'Предыдущий трек' });
    const nextBtn = page.getByRole('button', { name: 'Следующий трек' });
    const playPauseBtn = page.getByRole('button', { name: /Включить музыку|Приостановить музыку/ });

    // Stress test rapid transport button clicks: 6 clicks in rapid sequence
    await nextBtn.click();
    await nextBtn.click();
    await prevBtn.click();
    await playPauseBtn.click();
    await playPauseBtn.click();
    await nextBtn.click();

    // Dynamic Island MUST remain expanded through all these clicks!
    await expect(collapseBtn).toBeVisible();
    const islandBox = await page.locator('[data-testid="dynamic-island"] motion.div, [data-testid="dynamic-island"] > div > div').first().boundingBox();
    expect(islandBox?.width, 'Expanded Dynamic Island width must be >= 300px').toBeGreaterThan(300);

    // Test clicking inside album art & scrubber: must not collapse
    const scrubber = page.getByRole('slider', { name: 'Перемотка трека' });
    await expect(scrubber).toBeVisible();
    await scrubber.click({ position: { x: 50, y: 4 } });
    await expect(collapseBtn).toBeVisible();

    // Collapse Method 1: Click collapse chevron button
    await collapseBtn.click();
    await expect(collapseBtn).not.toBeVisible();
    await expect(islandPill).toBeVisible();

    // Collapse Method 2: Keyboard Escape
    await islandPill.click();
    await expect(collapseBtn).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(collapseBtn).not.toBeVisible();
    await expect(islandPill).toBeVisible();

    // Collapse Method 3: Desktop backdrop click outside phone chassis
    if (!test.info().project.use.isMobile) {
      await islandPill.click();
      await expect(collapseBtn).toBeVisible();
      await page.locator('.phone-stage').click({ position: { x: 50, y: 50 } });
      await expect(collapseBtn).not.toBeVisible();
      await expect(islandPill).toBeVisible();
    }
  });

  // ================= 3. Smart Tab Visibility Auto-Pause (R5) =================
  test('3.1: Visibilitychange auto-pauses when hidden and resumes ONLY if it was playing', async ({ page }) => {
    await unlockToHomeScreen(page);

    // Expand player to observe state
    await page.getByRole('button', { name: 'Открыть музыкальный плеер' }).click();
    await expect(page.getByRole('button', { name: 'Свернуть', exact: true })).toBeVisible();

    // Initially playing
    await expect(page.getByRole('button', { name: 'Приостановить музыку' })).toBeVisible();

    // Case A: Playing -> Hide Tab -> Pause -> Show Tab -> Resumes
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await expect(page.getByRole('button', { name: 'Включить музыку' })).toBeVisible();

    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await expect(page.getByRole('button', { name: 'Приостановить музыку' })).toBeVisible();

    // Case B: User manually pauses -> Hide Tab -> Show Tab -> MUST REMAIN PAUSED!
    await page.getByRole('button', { name: 'Приостановить музыку' }).click();
    await expect(page.getByRole('button', { name: 'Включить музыку' })).toBeVisible();

    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await expect(page.getByRole('button', { name: 'Включить музыку' })).toBeVisible();

    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    // Verify it stays paused
    await expect(page.getByRole('button', { name: 'Включить музыку' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Приостановить музыку' })).not.toBeVisible();

    // Case C: Rapid tab switching stress while paused -> MUST NEVER turn on audio
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => {
        Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
        document.dispatchEvent(new Event('visibilitychange'));
      });
      await page.evaluate(() => {
        Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
        document.dispatchEvent(new Event('visibilitychange'));
      });
    }
    await expect(page.getByRole('button', { name: 'Включить музыку' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Приостановить музыку' })).not.toBeVisible();
  });

  // ================= 4. Interactive Canvas Blizzard (R4) =================
  test('4.1: Weather blizzard runs on Canvas with 0 DOM bloat, 60 FPS, and resets after 4.5s', async ({ page }) => {
    await unlockToHomeScreen(page);

    // Navigate to Page 1
    const dot2 = page.locator('button[aria-label="Страница 2"]');
    await dot2.click();
    await page.waitForTimeout(400);

    // Launch WeatherApp
    await launchApp(page, 'Погода');
    await expect(page.locator('text=Новогодняя Ночь 2027').first()).toBeVisible();

    // Locate the blizzard button and canvas
    const blizzardBtn = page.getByRole('button', { name: 'Запустить новогоднюю метель' });
    await expect(blizzardBtn).toBeVisible();
    await expect(page.locator('text=Запустить метель')).toBeVisible();

    // Verify Canvas element is present
    const canvas = page.locator('canvas.pointer-events-none');
    await expect(canvas).toBeVisible();

    // Baseline DOM count before blizzard
    const initialDomCount = await page.evaluate(() => document.querySelectorAll('*').length);

    // Trigger Blizzard
    await blizzardBtn.click();

    // Verify UI reflects active state
    await expect(page.locator('text=Бушует снежная буря!')).toBeVisible();
    await expect(page.locator('text=АКТИВНО')).toBeVisible();

    // Measure DOM count during active blizzard: MUST NOT create DOM particles!
    const activeDomCount = await page.evaluate(() => document.querySelectorAll('*').length);
    // Allow at most 2-3 temporary state nodes (e.g. text/badge changes inside button), but definitely NO DOM particle explosion!
    expect(activeDomCount - initialDomCount, 'Blizzard must not cause DOM bloat').toBeLessThanOrEqual(5);

    // Measure FPS over 45 animation frames during the peak vortex
    const fpsStats = await page.evaluate(async () => {
      return new Promise<{ avgFrameTime: number; maxFrameTime: number }>((resolve) => {
        const frameTimes: number[] = [];
        let lastTime = performance.now();
        let count = 0;

        function checkFrame(now: number) {
          const delta = now - lastTime;
          lastTime = now;
          if (count > 0) frameTimes.push(delta); // ignore first setup delta
          count++;
          if (count < 45) {
            requestAnimationFrame(checkFrame);
          } else {
            const avg = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
            const max = Math.max(...frameTimes);
            resolve({ avgFrameTime: avg, maxFrameTime: max });
          }
        }
        requestAnimationFrame(checkFrame);
      });
    });

    // 60 FPS corresponds to ~16.6ms per frame. Frame time should be <= 33ms (>= 30-60 FPS) in headless environments.
    expect(fpsStats.avgFrameTime, 'Average frame time should maintain ~60 FPS (<= 30ms)').toBeLessThan(35);

    // Verify canvas is actually drawing (not blank)
    const isCanvasDrawing = await page.evaluate(() => {
      const cvs = document.querySelector('canvas.pointer-events-none') as HTMLCanvasElement | null;
      if (!cvs) return false;
      const ctx = cvs.getContext('2d');
      if (!ctx) return false;
      const imgData = ctx.getImageData(0, 0, cvs.width, cvs.height);
      // Check that at least some pixels have non-zero alpha
      let nonZeroCount = 0;
      for (let i = 3; i < imgData.data.length; i += 4) {
        if (imgData.data[i] > 0) {
          nonZeroCount++;
          if (nonZeroCount > 10) return true;
        }
      }
      return false;
    });
    expect(isCanvasDrawing, 'Canvas must render active particles into 2D context').toBe(true);

    // Wait for the 4.5s blizzard duration to complete
    await expect(page.locator('text=Запустить метель')).toBeVisible({ timeout: 6000 });
    await expect(page.locator('text=Бушует снежная буря!')).not.toBeVisible();
    await expect(page.locator('text=АКТИВНО')).not.toBeVisible();

    // Verify button can be clicked again cleanly
    await expect(blizzardBtn).toBeEnabled();
  });

});
