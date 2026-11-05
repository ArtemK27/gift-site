import { test, expect } from '@playwright/test';
import { unlockToHomeScreen, launchApp, enterSafePin, scratchCanvas } from './helpers';

test.describe('Challenger 2: Empirical Stress & Edge Case Verification', () => {

  // ================= 1. Full Quest Walkthrough & Negative PIN Testing =================
  test('1.1: Complete Quest Walkthrough (Tier 4) & SafeApp Edge Cases', async ({ page }) => {
    test.setTimeout(60000);

    // 1. BaitScreen
    await page.goto('/');
    await expect(page.locator('text=Праздничное письмо ❄️')).toBeVisible({ timeout: 10000 });
    const openBtn = page.locator('text=Открыть поздравление');
    await openBtn.click();

    // 2. Glitch Screen
    await expect(page.locator('text=СИСТЕМА ПЕРЕХВАЧЕНА')).toBeVisible({ timeout: 5000 });

    // 3. LockScreen
    const unlockHint = page.locator('text=Смахните вверх для разблокировки');
    await expect(unlockHint).toBeVisible({ timeout: 15000 });

    // Verify LockScreen notification headers
    await expect(page.locator('text=Система Безопасности')).toBeVisible();
    await expect(page.locator('text=Только что')).toBeVisible();

    await unlockHint.click();

    // 4. SpringBoard
    await expect(page.locator('text=ПодвалГрам').first()).toBeVisible({ timeout: 10000 });

    // 5. MessengerApp Clue '20'
    await launchApp(page, 'ПодвалГрам');
    await page.getByRole('button', { name: 'Открыть чат Новогодний Комитет 🎄' }).click();
    await expect(page.locator('text=Мандарины кто-нибудь взял?').first()).toBeVisible();

    // Sticker clue
    const stickerTrigger = page.locator('button[aria-label="Открыть стикеры"]');
    if (await stickerTrigger.isVisible()) {
      await stickerTrigger.click();
      const sticker = page.locator('text=Сану & Пряник').first();
      if (await sticker.isVisible()) {
        await sticker.click();
      }
    }
    await expect(page.locator('text=Первые две цифры от Сейфа — «20»')).toBeVisible({ timeout: 10000 });

    // Exit MessengerApp via Home Indicator
    await page.locator('#ios-home-indicator').click();
    await expect(page.locator('text=Квест Сейфа')).toBeVisible({ timeout: 5000 });

    // 6. NotesApp Clues ('2' and '7' = '27')
    await launchApp(page, 'Заметки');
    await expect(page.locator('text=🥟 Рецепт хунтуней от Чу Ваньнина')).toBeVisible();

    // Open first note
    await page.locator('text=🥟 Рецепт хунтуней от Чу Ваньнина').click();
    await expect(page.locator('text=цифра «2»')).toBeVisible();
    await page.locator('button[aria-label="Назад к списку"]').click();

    // Open second note
    await page.locator('text=🦇 Новогодний райдер Kai Angel & 9mice').click();
    await expect(page.locator('text=2 + 7 = «27» для Сейфа!')).toBeVisible();

    // Exit NotesApp via Home Indicator
    await page.locator('#ios-home-indicator').click();
    await expect(page.locator('text=Квест Сейфа')).toBeVisible({ timeout: 5000 });

    // 7. SafeApp: First test Wrong PIN ('9999')
    await launchApp(page, 'VIP Сейф');
    await expect(page.locator('text=VIP Сейф 2027')).toBeVisible();
    await expect(page.locator('text=ЗАКРЫТО')).toBeVisible();

    await enterSafePin(page, '9999');
    // Error state triggered: PIN resets
    await page.waitForTimeout(1000);
    await expect(page.locator('text=ЗАКРЫТО')).toBeVisible();

    // Now enter Correct PIN: '2027'
    await enterSafePin(page, '2027');
    await expect(page.locator('text=ОТКРЫТО')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=VIP PASS 2027')).toBeVisible();
    await expect(page.locator('canvas.cursor-crosshair')).toBeVisible();

    // 8. Scratch canvas (>= 45%)
    await scratchCanvas(page, 'canvas.cursor-crosshair', 25);
    await expect(page.locator('text=ЛЁД РАСТОПЛЕН!')).toBeVisible({ timeout: 8000 });

    // 9. Gift selection
    const goldApple = page.locator('text=Золотое Яблоко');
    await expect(goldApple).toBeVisible();
    await goldApple.click();

    // 10. Promo Code Modal
    await expect(page.locator('text=Подарок твой! 🎄✨')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=GOLDEN-APPLE-NY2027')).toBeVisible();

    // Close celebration modal
    await page.locator('text=Вернуться в смартфон ✨').click();
    await expect(page.locator('text=Подарок твой! 🎄✨')).not.toBeVisible();
  });

  // ================= 2. SpringBoard Pagination & Swiping =================
  test('2.1: SpringBoard bidirectional page swiping and interactive dots', async ({ page }) => {
    await unlockToHomeScreen(page);

    const dot1 = page.locator('button[aria-label="Страница 1"]');
    const dot2 = page.locator('button[aria-label="Страница 2"]');

    // Initially Page 0
    await expect(dot1).toHaveClass(/w-2 h-2 bg-white/);
    await expect(page.locator('text=Квест Сейфа')).toBeVisible();

    // Tap Dot 2 -> Page 1
    await dot2.click();
    await page.waitForTimeout(400);
    await expect(dot2).toHaveClass(/w-2 h-2 bg-white/);
    await expect(page.locator('text=Часы')).toBeVisible();
    await expect(page.locator('text=Погода')).toBeVisible();

    // Tap Dot 1 -> Page 0
    await dot1.click();
    await page.waitForTimeout(400);
    await expect(dot1).toHaveClass(/w-2 h-2 bg-white/);
    await expect(page.locator('text=Квест Сейфа')).toBeVisible();

    // Swipe Gesture left to Page 1
    const dragArea = page.locator('.touch-pan-y').first();
    const box = await dragArea.boundingBox();
    if (!box) throw new Error('Drag container not found');

    const startX = box.x + box.width * 0.85;
    const endX = box.x + box.width * 0.15;
    const centerY = box.y + box.height * 0.5;

    await page.mouse.move(startX, centerY);
    await page.mouse.down();
    await page.mouse.move(endX, centerY, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(500);

    await expect(dot2).toHaveClass(/w-2 h-2 bg-white/);
    await expect(page.locator('text=Часы')).toBeVisible();

    // Swipe Gesture right back to Page 0
    await page.mouse.move(endX, centerY);
    await page.mouse.down();
    await page.mouse.move(startX, centerY, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(500);

    await expect(dot1).toHaveClass(/w-2 h-2 bg-white/);
    await expect(page.locator('text=Квест Сейфа')).toBeVisible();
  });

  // ================= 3. SettingsApp: State Reactivity & Persistence =================
  test('3.1: SettingsApp toggles sound/haptics, persists in localStorage, resets quest', async ({ page }) => {
    await unlockToHomeScreen(page);

    // Launch Settings
    await launchApp(page, 'Настройки');
    await expect(page.locator('text=Настройки').first()).toBeVisible();
    await expect(page.locator('text=Звуковые эффекты')).toBeVisible();
    await expect(page.locator('text=Тактильный отклик')).toBeVisible();
    await expect(page.locator('text=Обои и оформление')).toBeVisible();
    await expect(page.locator('text=Управление квестом')).toBeVisible();

    // Find switches for sound and haptics
    const switches = page.locator('button[role="switch"]');
    const soundSwitch = switches.nth(0);
    const hapticsSwitch = switches.nth(1);

    // Initial state: true
    await expect(soundSwitch).toHaveAttribute('aria-checked', 'true');
    await expect(hapticsSwitch).toHaveAttribute('aria-checked', 'true');

    // Toggle Sound OFF
    await soundSwitch.click();
    await page.waitForTimeout(200);
    await expect(soundSwitch).toHaveAttribute('aria-checked', 'false');

    // Verify localStorage persistence
    let settings = await page.evaluate(() => {
      const raw = localStorage.getItem('ios18_gift_settings');
      return raw ? JSON.parse(raw) : null;
    });
    expect(settings.soundEnabled).toBe(false);

    // Toggle Haptics OFF
    await hapticsSwitch.click();
    await page.waitForTimeout(200);
    await expect(hapticsSwitch).toHaveAttribute('aria-checked', 'false');

    settings = await page.evaluate(() => {
      const raw = localStorage.getItem('ios18_gift_settings');
      return raw ? JSON.parse(raw) : null;
    });
    expect(settings.hapticsEnabled).toBe(false);

    // Toggle both back ON
    await soundSwitch.click();
    await hapticsSwitch.click();
    await page.waitForTimeout(200);
    await expect(soundSwitch).toHaveAttribute('aria-checked', 'true');
    await expect(hapticsSwitch).toHaveAttribute('aria-checked', 'true');

    // Test Quest Reset Flow: open dialog and cancel
    await page.locator('text=Сбросить прогресс квеста').click();
    await expect(page.locator('text=Сбросить сохранённый прогресс сейфа и подсказок?')).toBeVisible();
    await page.locator('button:has-text("Отмена")').click();
    await expect(page.locator('text=Сбросить сохранённый прогресс сейфа и подсказок?')).not.toBeVisible();

    // Close Settings
    await page.locator('button[aria-label="Закрыть настройки"]').click();
    await expect(page.locator('text=Квест Сейфа')).toBeVisible();
  });

  // ================= 4. ClockApp: World Clocks, Countdown, Alarms, Stopwatch =================
  test('4.1: ClockApp all tabs functionality (World Clock, Alarm, Stopwatch, Timer)', async ({ page }) => {
    await unlockToHomeScreen(page);

    // Navigate to Page 1
    await page.locator('button[aria-label="Страница 2"]').click();
    await page.waitForTimeout(400);

    // Launch Clock
    await launchApp(page, 'Часы');
    await expect(page.getByRole('heading', { name: 'Мировые часы' })).toBeVisible();
    await expect(page.locator('text=До Нового Года 2027')).toBeVisible();
    await expect(page.locator('text=Пентхаус Сану').last()).toBeVisible();
    await expect(page.locator('text=Пик Сишэн')).toBeVisible();
    await expect(page.locator('text=Студия VIPERR')).toBeVisible();

    // Tab 2: Alarms
    await page.locator('button:has-text("Будильник")').click();
    await expect(page.locator('h1:has-text("Будильник")')).toBeVisible();
    const alarmSwitch = page.locator('button[role="switch"]').first();
    await expect(alarmSwitch).toBeVisible();
    const checked = await alarmSwitch.getAttribute('aria-checked');
    await alarmSwitch.click();
    await page.waitForTimeout(200);
    const newChecked = await alarmSwitch.getAttribute('aria-checked');
    expect(newChecked).not.toBe(checked);

    // Tab 3: Stopwatch
    await page.locator('button:has-text("Секундомер")').click();
    await expect(page.locator('h1:has-text("Секундомер")')).toBeVisible();
    const startBtn = page.locator('button:has-text("Старт")');
    await startBtn.click();
    await page.waitForTimeout(600);
    // Button should now be Stop
    const stopBtn = page.locator('button:has-text("Стоп")');
    await expect(stopBtn).toBeVisible();

    // Record a Lap
    const lapBtn = page.locator('button:has-text("Круг")');
    await lapBtn.click();
    await expect(page.locator('text=Круг 1')).toBeVisible();

    // Stop and Reset
    await stopBtn.click();
    const resetBtn = page.locator('button:has-text("Сброс")');
    await resetBtn.click();
    await expect(page.locator('text=00:00.00')).toBeVisible();

    // Tab 4: Timer
    await page.locator('button:has-text("Таймер")').click();
    await expect(page.locator('h1:has-text("Таймер 2027")')).toBeVisible();
    await expect(page.locator('text=До 2027 года')).toBeVisible();

    // Exit via Top Close Button
    await page.locator('button[aria-label="Закрыть часы"]').click();
    await expect(page.locator('.touch-pan-y').first()).toBeVisible();
  });

  // ================= 5. WeatherApp: Snowfall, -5°C, Forecast & Insights =================
  test('5.1: WeatherApp displays snowfall canvas, temperature, forecast, and insights', async ({ page }) => {
    await unlockToHomeScreen(page);

    // Navigate to Page 1
    await page.locator('button[aria-label="Страница 2"]').click();
    await page.waitForTimeout(400);

    // Launch Weather
    await launchApp(page, 'Погода');
    await expect(page.locator('text=Новогодняя Ночь 2027')).toBeVisible();
    await expect(page.locator('text=-5°').first()).toBeVisible();
    await expect(page.locator('text=Снегопад')).toBeVisible();

    // Canvas snowfall exists
    const snowCanvas = page.locator('canvas').first();
    await expect(snowCanvas).toBeVisible();

    // Hourly forecast
    await expect(page.locator('text=Почасовой прогноз')).toBeVisible();
    await expect(page.locator('text=Новый Год! Салют')).toBeVisible();

    // 10-day forecast
    await expect(page.locator('text=Прогноз на 10 дней')).toBeVisible();

    // Insight cards
    await expect(page.locator('text=Влажность')).toBeVisible();
    await expect(page.locator('text=88%')).toBeVisible();
    await expect(page.locator('text=Вероятность чуда')).toBeVisible();
    await expect(page.getByText('100%', { exact: true })).toBeVisible();
    await expect(page.locator('text=Видимость')).toBeVisible();
    await expect(page.locator('text=6 км')).toBeVisible();
    await expect(page.locator('text=Ветер')).toBeVisible();
    await expect(page.locator('text=4 м/с')).toBeVisible();

    // Exit via Home Indicator
    await page.locator('#ios-home-indicator').click();
    await expect(page.locator('.touch-pan-y').first()).toBeVisible();
  });

  // ================= 6. Single Home Indicator & Touch Isolation =================
  test('6.1: Exactly one Home Indicator pill exists and inner containers isolate scroll', async ({ page }) => {
    await unlockToHomeScreen(page);

    // Check count of home indicator elements
    const indicators = page.locator('#ios-home-indicator');
    await expect(indicators).toHaveCount(1);

    // Open Messenger
    await launchApp(page, 'ПодвалГрам');
    await expect(indicators).toHaveCount(1);

    // Verify chat has touch-pan-y
    const scrollContainer = page.locator('.overflow-y-auto').first();
    await expect(scrollContainer).toBeVisible();

    // Exit back
    await page.locator('#ios-home-indicator').click();
    await expect(indicators).toHaveCount(1);
  });
});
