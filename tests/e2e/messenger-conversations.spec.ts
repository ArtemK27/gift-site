import { test, expect } from '@playwright/test';
import { launchApp, unlockToHomeScreen } from './helpers';

const committee = 'Открыть чат Новогодний Комитет 🎄';

test('separate conversations retain messages, drafts and photo while app is closed; reload resets them', async ({ page }) => {
  test.setTimeout(60000);
  await unlockToHomeScreen(page);
  await launchApp(page, 'ПодвалГрам');
  await expect(page.getByRole('button', { name: committee })).toBeVisible();
  await page.getByRole('button', { name: 'Открыть чат Чу Ваньнин' }).click();
  await page.getByRole('textbox', { name: 'Сообщение' }).fill('Смотрю заметки');
  await page.getByRole('button', { name: 'Отправить сообщение' }).click();
  await expect(page.getByText('Не спеши: после моей заметки', { exact: false })).toBeVisible({ timeout: 8000 });
  await page.getByRole('textbox', { name: 'Сообщение' }).fill('Вторая часть позже');
  await page.getByRole('button', { name: 'Назад к чатам' }).click();
  await page.getByRole('button', { name: committee }).click();
  await page.getByRole('button', { name: 'Раскрыть фото в чате' }).click();
  await expect(page.getByRole('button', { name: 'Фото раскрыто' })).toBeVisible();
  await page.getByRole('button', { name: 'Открыть стикеры' }).click();
  await page.getByRole('button', { name: 'Сану & Пряник' }).click();
  await expect(page.getByText('Первые две цифры от Сейфа — «20»', { exact: false })).toBeVisible({ timeout: 8000 });
  await expect(page.getByRole('button', { name: 'Закрыть мессенджер' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Назад к чатам' }).click();
  await page.getByRole('button', { name: 'Закрыть мессенджер' }).click();
  await launchApp(page, 'ПодвалГрам');
  await page.getByRole('button', { name: committee }).click();
  await expect(page.getByRole('button', { name: 'Фото раскрыто' })).toBeVisible();
  await expect(page.getByText('Первые две цифры от Сейфа — «20»', { exact: false })).toHaveCount(1);
  await page.getByRole('button', { name: 'Назад к чатам' }).click();
  await page.getByRole('button', { name: 'Открыть чат Чу Ваньнин' }).click();
  await expect(page.getByText('Смотрю заметки', { exact: true })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Сообщение' })).toHaveValue('Вторая часть позже');
  await page.reload();
  await page.getByText('Открыть поздравление').click();
  await page.getByText('Смахните вверх для разблокировки').click();
  await launchApp(page, 'ПодвалГрам');
  await page.getByRole('button', { name: 'Открыть чат Чу Ваньнин' }).click();
  await expect(page.getByText('Смотрю заметки', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('textbox', { name: 'Сообщение' })).toHaveValue('');
});

test('composer, back button and close button remain within mobile app bounds; opening gift never requests fullscreen', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(document.documentElement, 'requestFullscreen', { value: () => { throw new Error('Fullscreen should not be requested'); } });
  });
  await unlockToHomeScreen(page);
  await launchApp(page, 'ПодвалГрам');
  await page.getByRole('button', { name: committee }).click();
  const bounds = await page.locator('.will-change-transform').boundingBox();
  await expect(page.getByRole('button', { name: 'Закрыть мессенджер' })).toHaveCount(0);
  for (const name of ['Назад к чатам', 'Отправить сообщение']) {
    const button = await page.getByRole('button', { name }).boundingBox();
    expect(button && bounds).toBeTruthy();
    expect(button!.x).toBeGreaterThanOrEqual(bounds!.x);
    expect(button!.x + button!.width).toBeLessThanOrEqual(bounds!.x + bounds!.width + 1);
  }
  await page.getByRole('button', { name: 'Назад к чатам' }).click();
  const close = await page.getByRole('button', { name: 'Закрыть мессенджер' }).boundingBox();
  expect(close && bounds).toBeTruthy();
  expect(close!.x + close!.width).toBeLessThanOrEqual(bounds!.x + bounds!.width + 1);
  expect(await page.evaluate(() => !!document.fullscreenElement)).toBe(false);
});
