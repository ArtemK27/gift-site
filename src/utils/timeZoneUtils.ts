/**
 * Timezone synchronization utilities for UTC+7 (MSK+4).
 * Computes current wall-clock time in UTC+7, countdown to Jan 1, 2027 00:00:00 (UTC+7),
 * and live elapsed time in 2027 ("Мы в 2027 году уже: [ЧЧ:ММ:СС]").
 */

export const UTC_PLUS_7_OFFSET_MS = 7 * 60 * 60 * 1000;

// Target: 2027-01-01 00:00:00 in UTC+7
export const NY_2027_UTC7_WALL_MS = Date.UTC(2027, 0, 1, 0, 0, 0);

export interface Utc7TimeSnapshot {
  /** Formatted HH:MM in UTC+7 for status bar */
  hm: string;
  /** Formatted HH:MM:SS in UTC+7 */
  hms: string;
  /** Date label in Russian, e.g. "1 ЯНВ" or "31 ДЕК" */
  dateShort: string;
  /** Whether UTC+7 has reached or passed Jan 1, 2027 00:00:00 */
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
   * After midnight Jan 1, 2027 (UTC+7), shows actual elapsed time in 2027.
   * Before 2027, shows current UTC+7 time-of-day HH:MM:SS so the live counter
   * is always actively ticking every second during preview and after midnight.
   */
  elapsedIn2027Hms: string;
  elapsedDaysIn2027: number;
}

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

export function getUtc7TimeSnapshot(now: Date = new Date()): Utc7TimeSnapshot {
  const utc7WallMs = now.getTime() + UTC_PLUS_7_OFFSET_MS;
  const utc7Date = new Date(utc7WallMs);

  const hours = utc7Date.getUTCHours();
  const minutes = utc7Date.getUTCMinutes();
  const seconds = utc7Date.getUTCSeconds();
  const day = utc7Date.getUTCDate();
  const month = utc7Date.getUTCMonth();

  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');

  const hm = `${hh}:${mm}`;
  const hms = `${hh}:${mm}:${ss}`;
  const dateShort = `${day} ${MONTHS_SHORT_RU[month] || 'ДЕК'}`;

  const diffTo2027 = NY_2027_UTC7_WALL_MS - utc7WallMs;
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

  // Count-up in 2027 calculation
  let elapsedIn2027Hms = hms;
  let elapsedDaysIn2027 = 0;

  if (isNewYearReached) {
    const elapsedMs = Math.max(0, utc7WallMs - NY_2027_UTC7_WALL_MS);
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
