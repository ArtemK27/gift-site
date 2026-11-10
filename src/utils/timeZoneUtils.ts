/**
 * Timezone synchronization utilities for UTC+10 (MSK+7).
 * Computes current wall-clock time in UTC+10, countdown to Jan 1, 2027 00:00:00 (UTC+10),
 * and live elapsed time in 2027 once Jan 1, 2027 arrives.
 */

export const UTC_PLUS_10_OFFSET_MS = 10 * 60 * 60 * 1000;
export const UTC_PLUS_7_OFFSET_MS = UTC_PLUS_10_OFFSET_MS;

// Target: 2027-01-01 00:00:00 in UTC+10
export const NY_2027_UTC10_WALL_MS = Date.UTC(2027, 0, 1, 0, 0, 0);
export const NY_2027_UTC7_WALL_MS = NY_2027_UTC10_WALL_MS;

export interface Utc10TimeSnapshot {
  /** Formatted HH:MM in UTC+10 for status bar */
  hm: string;
  /** Formatted HH:MM:SS in UTC+10 */
  hms: string;
  /** Date label in Russian, e.g. "1 ЯНВ" or "31 ДЕК" */
  dateShort: string;
  /** Whether UTC+10 has reached or passed Jan 1, 2027 00:00:00 */
  isNewYearReached: boolean;
  /** Countdown components to 2027 (0 if already reached) */
  countdown: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    hmsFormatted: string;
  };
  /**
   * Live count-up formatted as HH:MM:SS ("Мы в 2027 году уже: [ЧЧ:ММ:СС]").
   * After midnight Jan 1, 2027 (UTC+10), shows actual elapsed time in 2027.
   */
  elapsedIn2027Hms: string;
  elapsedDaysIn2027: number;
}

export type Utc7TimeSnapshot = Utc10TimeSnapshot;

const MONTHS_SHORT_RU = [
  'ЯНВ',
  'ФЕВ',
  'МАР',
  'АПР',
  'МАЙ',
  'ИЮН',
  'ИЮЛ',
  'АВГ',
  'СЕН',
  'ОКТ',
  'НОЯ',
  'ДЕК',
];

export function getUtc10TimeSnapshot(now: Date = new Date()): Utc10TimeSnapshot {
  const utc10WallMs = now.getTime() + UTC_PLUS_10_OFFSET_MS;
  const utc10Date = new Date(utc10WallMs);

  const hours = utc10Date.getUTCHours();
  const minutes = utc10Date.getUTCMinutes();
  const seconds = utc10Date.getUTCSeconds();
  const day = utc10Date.getUTCDate();
  const month = utc10Date.getUTCMonth();

  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');

  const hm = `${hh}:${mm}`;
  const hms = `${hh}:${mm}:${ss}`;
  const dateShort = `${day} ${MONTHS_SHORT_RU[month] || 'ДЕК'}`;

  const diffTo2027 = NY_2027_UTC10_WALL_MS - utc10WallMs;
  const isNewYearReached = diffTo2027 <= 0;

  // Countdown calculation
  const remainingMs = Math.max(0, diffTo2027);
  const cDays = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
  const cHours = Math.floor((remainingMs / (1000 * 60 * 60)) % 24);
  const cMinutes = Math.floor((remainingMs / (1000 * 60)) % 60);
  const cSeconds = Math.floor((remainingMs / 1000) % 60);
  const hmsFormatted = `${String(cHours).padStart(2, '0')}:${String(cMinutes).padStart(
    2,
    '0'
  )}:${String(cSeconds).padStart(2, '0')}`;

  // Count-up in 2027 calculation (only active once 2027 has started)
  let elapsedIn2027Hms = '00:00:00';
  let elapsedDaysIn2027 = 0;

  if (isNewYearReached) {
    const elapsedMs = Math.max(0, utc10WallMs - NY_2027_UTC10_WALL_MS);
    elapsedDaysIn2027 = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
    const totalHours = Math.floor(elapsedMs / (1000 * 60 * 60));
    const eMinutes = Math.floor((elapsedMs / (1000 * 60)) % 60);
    const eSeconds = Math.floor((elapsedMs / 1000) % 60);
    elapsedIn2027Hms = `${String(totalHours).padStart(2, '0')}:${String(eMinutes).padStart(
      2,
      '0'
    )}:${String(eSeconds).padStart(2, '0')}`;
  }

  return {
    hm,
    hms,
    dateShort,
    isNewYearReached,
    countdown: {
      days: cDays,
      hours: cHours,
      minutes: cMinutes,
      seconds: cSeconds,
      hmsFormatted,
    },
    elapsedIn2027Hms,
    elapsedDaysIn2027,
  };
}

export const getUtc7TimeSnapshot = getUtc10TimeSnapshot;

