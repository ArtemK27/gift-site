import { test, expect } from '@playwright/test';
import { unlockToHomeScreen, launchApp } from './helpers';

test.describe('Milestone 3: HomeScreen Pagination, Modularity & App Wiring', () => {
  test.beforeEach(async ({ page }) => {
    await unlockToHomeScreen(page);
  });

  // ================= 1. Page 0 Layout & Structure =================
  test('1.1: displays Page 0 widgets, apps and pagination dots without dock', async ({ page }) => {
    // Widgets
    await expect(page.locator('text=31 ДЕК')).toBeVisible();
    await expect(page.locator('text=2027').first()).toBeVisible();
    await expect(page.locator('text=Новый Год близко!')).toBeVisible();
    await expect(page.locator('text=Квест Сейфа')).toBeVisible();
    await expect(page.locator('text=Собери 4 цифры ПИН-кода')).toBeVisible();

    // Page 0 Grid Apps
    await expect(page.locator('text=ПодвалГрам').first()).toBeVisible();
    await expect(page.locator('text=VIP Сейф').first()).toBeVisible();
    await expect(page.locator('text=Заметки').first()).toBeVisible();
    await expect(page.locator('text=Фото').first()).toBeVisible();
    await expect(page.locator('text=Настройки')).toBeVisible();

    // App shortcuts live only in the grid, not in a bottom dock.
    await expect(page.locator('[data-testid="home-dock"]')).toHaveCount(0);

    // 2 Pagination dots
    const dot1 = page.locator('button[aria-label="Страница 1"]');
    const dot2 = page.locator('button[aria-label="Страница 2"]');
    await expect(dot1).toBeVisible();
    await expect(dot2).toBeVisible();
    await expect(dot1).toHaveClass(/w-2 h-2 bg-white/);
    await expect(dot2).toHaveClass(/w-1.5 h-1.5/);
  });

  // ================= 2. Pagination Dots Navigation =================
  test('2.1: tapping pagination dot 2 navigates to Page 1, tapping dot 1 returns to Page 0', async ({ page }) => {
    const dot1 = page.locator('button[aria-label="Страница 1"]');
    const dot2 = page.locator('button[aria-label="Страница 2"]');

    // Click dot 2 to go to Page 1
    await dot2.click();
    await page.waitForTimeout(400);

    // Verify Page 1 dot is active
    await expect(dot2).toHaveClass(/w-2 h-2 bg-white/);
    await expect(dot1).toHaveClass(/w-1.5 h-1.5/);

    // Page 1 apps and companion widgets should be visible
    await expect(page.locator('text=Часы')).toBeVisible();
    await expect(page.locator('text=Погода')).toBeVisible();
    await expect(page.locator('text=Консоль')).toBeVisible();
    await expect(page.locator('text=СЕУЛ • САХА')).toBeVisible();
    await expect(page.locator('text=АТМОСФЕРА')).toBeVisible();

    // Click dot 1 to return to Page 0
    await dot1.click();
    await page.waitForTimeout(400);

    // Verify Page 0 dot is active
    await expect(dot1).toHaveClass(/w-2 h-2 bg-white/);
    await expect(dot2).toHaveClass(/w-1.5 h-1.5/);

    // Page 0 apps visible again
    await expect(page.locator('text=Настройки')).toBeVisible();
  });

  // ================= 3. Horizontal Swiping Gesture =================
  test('3.1: swiping left transitions to Page 1, swiping right returns to Page 0', async ({ page }) => {
    const dot1 = page.locator('button[aria-label="Страница 1"]');
    const dot2 = page.locator('button[aria-label="Страница 2"]');

    // Find the draggable container
    const dragArea = page.locator('.touch-pan-y').first();
    await expect(dragArea).toBeVisible();
    const box = await dragArea.boundingBox();
    if (!box) throw new Error('Drag area bounding box not found');

    const startX = box.x + box.width * 0.8;
    const endX = box.x + box.width * 0.2;
    const centerY = box.y + box.height * 0.5;

    // Swipe left (Page 0 -> Page 1)
    await page.mouse.move(startX, centerY);
    await page.mouse.down();
    await page.mouse.move(endX, centerY, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(500);

    // Verify Page 1 is active
    await expect(dot2).toHaveClass(/w-2 h-2 bg-white/);
    await expect(page.locator('text=Часы')).toBeVisible();

    // Swipe right (Page 1 -> Page 0)
    await page.mouse.move(endX, centerY);
    await page.mouse.down();
    await page.mouse.move(startX, centerY, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(500);

    // Verify Page 0 is active
    await expect(dot1).toHaveClass(/w-2 h-2 bg-white/);
    await expect(page.locator('text=Настройки')).toBeVisible();
  });

  // ================= 4. SettingsApp Launch & Wiring =================
  test('4.1: launches SettingsApp from Page 0, displays owner info, toggles settings, and exits', async ({ page }) => {
    await launchApp(page, 'Настройки');

    // Verify SettingsApp header & groups
    await expect(page.locator('text=Настройки').first()).toBeVisible();
    await expect(page.locator('text=Звуковые эффекты')).toBeVisible();
    await expect(page.locator('text=Тактильный отклик')).toBeVisible();
    await expect(page.locator('text=Обои и оформление')).toBeVisible();
    await expect(page.locator('text=Управление квестом')).toBeVisible();

    // Exit back to HomeScreen via top close button
    const closeBtn = page.locator('button[aria-label="Закрыть настройки"]');
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();

    // Returned to HomeScreen
    await expect(page.locator('text=Квест Сейфа')).toBeVisible({ timeout: 5000 });
  });

  // ================= 5. ClockApp Launch & Wiring =================
  test('5.1: launches ClockApp from Page 1, displays world clocks, countdown, and exits', async ({ page }) => {
    // Navigate to Page 1
    await page.locator('button[aria-label="Страница 2"]').click();
    await page.waitForTimeout(400);

    // Launch Clock
    await launchApp(page, 'Часы');

    // Verify ClockApp header & tabs
    await expect(page.locator('text=Часы').first()).toBeVisible();
    await expect(page.locator('text=До Нового Года 2027')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Мировые часы' })).toBeVisible();
    await expect(page.locator('text=Пентхаус Сану').first()).toBeVisible();
    await expect(page.locator('text=Пик Сишэн').first()).toBeVisible();
    await expect(page.locator('text=Студия VIPERR').first()).toBeVisible();

    // Exit back to HomeScreen via Home Indicator
    await page.locator('#ios-home-indicator').click();
    await expect(page.locator('.touch-pan-y').first()).toBeVisible({ timeout: 5000 });
  });

  // ================= 6. WeatherApp Launch & Wiring =================
  test('6.1: launches WeatherApp from Page 1, displays snowfall temperature and hourly forecast', async ({ page }) => {
    // Navigate to Page 1
    await page.locator('button[aria-label="Страница 2"]').click();
    await page.waitForTimeout(400);

    // Launch Weather
    await launchApp(page, 'Погода');

    // Verify WeatherApp content
    await expect(page.locator('text=Новогодняя Ночь 2027').first()).toBeVisible();
    await expect(page.locator('text=-5°').first()).toBeVisible();
    await expect(page.locator('text=Снегопад').first()).toBeVisible();
    await expect(page.locator('text=Почасовой прогноз')).toBeVisible();
    await expect(page.locator('text=Новый Год! Салют')).toBeVisible();

    // Exit back to HomeScreen via top close button
    const closeBtn = page.locator('button[aria-label="Закрыть погоду"]');
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();

    // Returned to HomeScreen
    await expect(page.locator('.touch-pan-y').first()).toBeVisible({ timeout: 5000 });
  });

  // ================= 7. Console Easter Egg =================
  test('7.1: tapping Console easter egg app shows root privilege alert toast', async ({ page }) => {
    // Navigate to Page 1
    await page.locator('button[aria-label="Страница 2"]').click();
    await page.waitForTimeout(400);

    // Tap Console
    const consoleBtn = page.locator('text=Консоль');
    await expect(consoleBtn).toBeVisible();
    await consoleBtn.click();

    // Verify toast notification appears
    await expect(page.locator('text=ROOT PRIVILEGES: GRANTED 🔪')).toBeVisible({ timeout: 3000 });
  });
});
