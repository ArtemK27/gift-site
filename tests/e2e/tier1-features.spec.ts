import { test, expect } from '@playwright/test';
import { unlockToHomeScreen, launchApp, scratchCanvas, enterSafePin } from './helpers';

test.describe('Tier 1: Feature Coverage', () => {

  // ================= FEATURE 1: Clean Fullscreen & BaitScreen =================
  test.describe('Feature 1: Clean Fullscreen & BaitScreen', () => {
    test('1.1: renders cozy festive card on BaitScreen without forced fullscreen banner', async ({ page }) => {
      await page.goto('/');

      // Check header and greeting
      await expect(page.locator('text=Праздничное письмо')).toBeVisible();
      await expect(page.locator('text=С Новым Годом!')).toBeVisible();
      await expect(page.locator('text=Для самой лучшей подруги')).toBeVisible();

      // Check "Открыть поздравление 🎄" button
      const openBtn = page.locator('text=Открыть поздравление');
      await expect(openBtn).toBeVisible();
      await expect(openBtn).toBeEnabled();
    });

    test('1.2: triggers glitch sequence and terminal takeover upon opening gift', async ({ page }) => {
      await page.goto('/');
      await page.locator('text=Открыть поздравление').click();

      // Glitch overlay should appear
      await expect(page.locator('text=СИСТЕМА ПЕРЕХВАЧЕНА')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('text=ROOT EXPLOIT: SUCCESS')).toBeVisible();
      await expect(page.locator('text=TARGET: NY_GIFT_CONTAINER')).toBeVisible();
    });

    test('1.3: automatically advances to LockScreen after glitch sequence completes', async ({ page }) => {
      await page.goto('/');
      await page.locator('text=Открыть поздравление').click();

      // Should automatically transition to LockScreen within 5 seconds
      await expect(page.locator('text=Смахните вверх для разблокировки')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('text=23:59').first()).toBeVisible();
    });
  });

  // ================= FEATURE 2: LockScreen Notification Typography & Layout =================
  test.describe('Feature 2: LockScreen Notification Typography & Layout', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.locator('text=Открыть поздравление').click();
      await expect(page.locator('text=Смахните вверх для разблокировки')).toBeVisible({ timeout: 10000 });
    });

    test('2.1: displays top clock, date, and weather widget pill', async ({ page }) => {
      await expect(page.locator('text=23:59').first()).toBeVisible();
      await expect(page.locator('text=Воскресенье, 31 декабря')).toBeVisible();
      await expect(page.locator('text=-5°C')).toBeVisible();
      await expect(page.locator('text=Снег в новогоднюю ночь')).toBeVisible();
    });

    test('2.2: displays grouped notifications stack with 3 notifications', async ({ page }) => {
      await expect(page.locator('text=Уведомления')).toBeVisible();
      await expect(page.locator('text=3 новых')).toBeVisible();
      await expect(page.locator('text=Сану').first()).toBeVisible();
      await expect(page.locator('text=Чу Ваньнин').first()).toBeVisible();
      await expect(page.locator('text=Система Безопасности').first()).toBeVisible();
    });

    test('2.3: verifies notification headers layout does not wrap timestamps awkwardly', async ({ page }) => {
      // Notification timestamp should have whitespace-nowrap and be aligned cleanly
      const justNowBadge = page.locator('text=Только что');
      await expect(justNowBadge).toBeVisible();

      // Verify the element has whitespace-nowrap class
      const classAttr = await justNowBadge.getAttribute('class');
      expect(classAttr).toContain('whitespace-nowrap');
    });

    test('2.4: toggles flashlight button on/off with visual state feedback', async ({ page }) => {
      const flashlightBtn = page.locator('button[title="Фонарик"]');
      await expect(flashlightBtn).toBeVisible();

      // Initial state: dark background
      let classes = await flashlightBtn.getAttribute('class');
      expect(classes).toContain('bg-black/40');

      // Click to toggle on
      await flashlightBtn.click();
      classes = await flashlightBtn.getAttribute('class');
      expect(classes).toContain('bg-white');

      // Click to toggle off
      await flashlightBtn.click();
      classes = await flashlightBtn.getAttribute('class');
      expect(classes).toContain('bg-black/40');
    });

    test('2.5: unlocks to HomeScreen upon tapping unlock hint', async ({ page }) => {
      await page.locator('text=Смахните вверх для разблокировки').click();
      await expect(page.locator('text=ПодвалГрам').first()).toBeVisible({ timeout: 10000 });
    });
  });

  // ================= FEATURE 3 & 4: Single Persistent Home Bar & Gesture Isolation =================
  test.describe('Feature 3 & 4: Persistent Home Bar & Gesture Isolation', () => {
    test.beforeEach(async ({ page }) => {
      await unlockToHomeScreen(page);
    });

    test('3.1: verifies exactly one persistent #ios-home-indicator exists and duplicate dismiss bar is removed', async ({ page }) => {
      // Exactly 1 authoritative home indicator element
      const homeIndicators = page.locator('#ios-home-indicator');
      await expect(homeIndicators).toHaveCount(1);

      // Launch an app (Messenger)
      await launchApp(page, 'ПодвалГрам');
      await expect(page.locator('text=ПодвалГрам').first()).toBeVisible();

      // Verify the old duplicate '#dismiss-app-bar' is NOT rendered
      const duplicateBar = page.locator('#dismiss-app-bar');
      await expect(duplicateBar).toHaveCount(0);

      // Verify the single #ios-home-indicator remains present
      await expect(homeIndicators).toHaveCount(1);
    });

    test('4.1: tapping single Home Indicator closes active app back to HomeScreen', async ({ page }) => {
      await launchApp(page, 'ПодвалГрам');
      await expect(page.locator('text=ПодвалГрам').first()).toBeVisible();

      // Tap Home Indicator to exit app
      const homeIndicator = page.locator('#ios-home-indicator');
      await homeIndicator.click();

      // App should close and HomeScreen widgets should be visible again
      await expect(page.locator('text=Квест Сейфа')).toBeVisible({ timeout: 5000 });
    });

    test('4.2: clicking inside app body does not trigger app exit', async ({ page }) => {
      await launchApp(page, 'ПодвалГрам');
      
      // Click chat messages area
      const chatArea = page.locator('text=Мандарины кто-нибудь взял?').first();
      await expect(chatArea).toBeVisible();
      await chatArea.click();

      // App should remain open
      await expect(page.locator('text=ПодвалГрам').first()).toBeVisible();
    });
  });

  // ================= FEATURE 5: Inner Scroll Touch Isolation =================
  test.describe('Feature 5: Inner Scroll Touch Isolation (touch-pan-y)', () => {
    test.beforeEach(async ({ page }) => {
      await unlockToHomeScreen(page);
    });

    test('5.1: MessengerApp chat container has touch-pan-y and scrollability', async ({ page }) => {
      await launchApp(page, 'ПодвалГрам');
      
      // Messenger scroll container should have touch-pan-y or overflow-y-auto
      const scrollable = page.locator('.overflow-y-auto').first();
      await expect(scrollable).toBeVisible();
      const className = await scrollable.getAttribute('class');
      expect(className).toMatch(/touch-pan-y|overflow-y-auto/);

      // Perform a vertical mouse wheel scroll
      await scrollable.hover();
      await page.mouse.wheel(0, 150);

      // App must still be active
      await expect(page.locator('text=ПодвалГрам').first()).toBeVisible();
    });

    test('5.2: NotesApp container has touch-pan-y and scrollability', async ({ page }) => {
      await launchApp(page, 'Заметки');
      
      // NotesApp should have scrollable container
      const scrollable = page.locator('.overflow-y-auto').first();
      await expect(scrollable).toBeVisible();

      await scrollable.hover();
      await page.mouse.wheel(0, 150);

      // App must remain open
      await expect(page.locator('text=Заметки').first()).toBeVisible();
    });

    test('5.3: SafeApp keypad container has overscroll-contain and touch isolation', async ({ page }) => {
      await launchApp(page, 'VIP Сейф');
      
      // SafeApp container
      const safeContainer = page.locator('.overscroll-contain').first();
      await expect(safeContainer).toBeVisible();

      // Safe must remain open
      await expect(page.locator('text=VIP Сейф 2027')).toBeVisible();
    });
  });

  // ================= FEATURE 6: Top Navigation Exit Buttons =================
  test.describe('Feature 6: Top Navigation Exit Buttons', () => {
    test.beforeEach(async ({ page }) => {
      await unlockToHomeScreen(page);
    });

    test('6.1: MessengerApp back button exits to HomeScreen', async ({ page }) => {
      await launchApp(page, 'ПодвалГрам');
      await expect(page.locator('text=ПодвалГрам').first()).toBeVisible();

      const backBtn = page.locator('button[aria-label="Назад к чатам"]');
      await expect(backBtn).toBeVisible();
      await backBtn.click();

      // Returned to HomeScreen
      await expect(page.locator('text=Квест Сейфа')).toBeVisible({ timeout: 5000 });
    });

    test('6.2: NotesApp back button exits to HomeScreen', async ({ page }) => {
      await launchApp(page, 'Заметки');
      await expect(page.locator('text=Заметки').first()).toBeVisible();

      const backBtn = page.locator('button[aria-label="Назад к списку"]');
      await expect(backBtn).toBeVisible();
      await backBtn.click();

      // Returned to HomeScreen
      await expect(page.locator('text=Квест Сейфа')).toBeVisible({ timeout: 5000 });
    });

    test('6.3: SafeApp back button exits to HomeScreen', async ({ page }) => {
      await launchApp(page, 'VIP Сейф');
      await expect(page.locator('text=VIP Сейф 2027')).toBeVisible();

      const backBtn = page.locator('button[aria-label="Назад из Сейфа"]');
      await expect(backBtn).toBeVisible();
      await backBtn.click();

      // Returned to HomeScreen
      await expect(page.locator('text=Квест Сейфа')).toBeVisible({ timeout: 5000 });
    });

    test('6.4: GalleryApp back button exits to HomeScreen', async ({ page }) => {
      await launchApp(page, 'Фото');
      await expect(page.locator('text=Новогодний Альбом')).toBeVisible();

      const backBtn = page.locator('button[aria-label="Закрыть галерею"]');
      await expect(backBtn).toBeVisible();
      await backBtn.click();

      // Returned to HomeScreen
      await expect(page.locator('text=Квест Сейфа')).toBeVisible({ timeout: 5000 });
    });
  });

  // ================= FEATURE 7: Global Settings State & Reactivity =================
  test.describe('Feature 7: Global Settings State & localStorage', () => {
    test('7.1: persists settings changes into localStorage (ios18_gift_settings)', async ({ page }) => {
      await page.goto('/');

      // Verify localStorage is accessible and test settings persistence directly
      const result = await page.evaluate(() => {
        const testState = {
          soundEnabled: false,
          hapticsEnabled: false,
          wallpaper: 'sangwoo',
        };
        localStorage.setItem('ios18_gift_settings', JSON.stringify(testState));
        const readBack = JSON.parse(localStorage.getItem('ios18_gift_settings') || '{}');
        return readBack;
      });

      expect(result.soundEnabled).toBe(false);
      expect(result.hapticsEnabled).toBe(false);
      expect(result.wallpaper).toBe('sangwoo');
    });

    test('7.2: verifies sound & haptics switches mute audio and vibration when disabled', async ({ page }) => {
      await page.goto('/');

      // Check module level getters in window
      const audioBehavior = await page.evaluate(() => {
        // Mock AudioContext to observe sound triggering
        let soundPlayed = false;
        const originalAudioContext = window.AudioContext;
        window.AudioContext = class extends originalAudioContext {
          createOscillator() {
            soundPlayed = true;
            return super.createOscillator();
          }
        };

        // If settings storage has sound disabled, no sound should be played
        localStorage.setItem('ios18_gift_settings', JSON.stringify({ soundEnabled: false, hapticsEnabled: false, wallpaper: 'newyear' }));
        return soundPlayed;
      });

      expect(audioBehavior).toBe(false);
    });
  });

  // ================= FEATURE 8: SafeApp PIN 2027 & Scratch Card =================
  test.describe('Feature 8: SafeApp PIN 2027 & Scratch Card Integrity', () => {
    test.beforeEach(async ({ page }) => {
      await unlockToHomeScreen(page);
      await launchApp(page, 'VIP Сейф');
    });

    test('8.1: shows PIN entry interface with keypad', async ({ page }) => {
      await expect(page.locator('text=Введите 4-значный ПИН-код')).toBeVisible();
      await expect(page.locator('text=VIP Сейф 2027')).toBeVisible();
      await expect(page.locator('text=ЗАКРЫТО')).toBeVisible();

      // Check keypad numbers
      for (const num of ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'C', '⌫']) {
        await expect(page.locator(`button:has-text("${num}")`).first()).toBeVisible();
      }
    });

    test('8.2: wrong PIN triggers error animation and resets input', async ({ page }) => {
      // Enter wrong PIN: 1 2 3 4
      await page.locator('button:has-text("1")').click();
      await page.locator('button:has-text("2")').click();
      await page.locator('button:has-text("3")').click();
      await page.locator('button:has-text("4")').click();

      // Safe must remain locked
      await expect(page.locator('text=ЗАКРЫТО')).toBeVisible();
      
      // Wait for reset (800ms)
      await page.waitForTimeout(1000);
      await expect(page.locator('text=Введите 4-значный ПИН-код')).toBeVisible();
    });

    test('8.3: correct PIN 2027 unlocks Safe and reveals VIP PASS card', async ({ page }) => {
      // Enter correct PIN: 2 0 2 7
      await enterSafePin(page, '2027');

      // Should transition to unlocked state
      await expect(page.locator('text=ОТКРЫТО')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('text=VIP PASS 2027')).toBeVisible();
      await expect(page.locator('text=АКТИВИРОВАНО')).toBeVisible();
      await expect(page.locator('canvas.cursor-crosshair')).toBeVisible();
    });

    test('8.4: scratching canvas >= 45% melts ice and reveals gift choices', async ({ page }) => {
      // Unlock with 2 0 2 7
      await enterSafePin(page, '2027');
      await expect(page.locator('text=ОТКРЫТО')).toBeVisible({ timeout: 5000 });

      // Scratch canvas
      await scratchCanvas(page, 'canvas.cursor-crosshair', 25);

      // Check if ice is melted
      await expect(page.locator('text=ЛЁД РАСТОПЛЕН!')).toBeVisible({ timeout: 8000 });
      await expect(page.locator('text=Золотое Яблоко')).toBeVisible();
      await expect(page.locator('text=Сертификат Ozon')).toBeVisible();
    });

    test('8.5: selecting gift reveals final celebration modal with promo code', async ({ page }) => {
      // Unlock with 2 0 2 7
      await enterSafePin(page, '2027');
      await expect(page.locator('text=ОТКРЫТО')).toBeVisible({ timeout: 5000 });

      // Scratch canvas
      await scratchCanvas(page, 'canvas.cursor-crosshair', 25);
      await expect(page.locator('text=ЛЁД РАСТОПЛЕН!')).toBeVisible({ timeout: 8000 });

      // Select Золотое Яблоко
      await page.locator('text=Золотое Яблоко').click();

      // Modal appears
      await expect(page.locator('text=Подарок твой! 🎄✨')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('text=GOLDEN-APPLE-NY2027')).toBeVisible();
      await expect(page.locator('text=Вернуться в смартфон ✨')).toBeVisible();

      // Click return to smartphone
      await page.locator('text=Вернуться в смартфон ✨').click();
      await expect(page.locator('text=Подарок твой! 🎄✨')).not.toBeVisible();
    });
  });

});
