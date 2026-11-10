import test from 'node:test';
import assert from 'node:assert/strict';
import { formatTrackTime, clampProgressPercent } from './DynamicIsland';
import { THREADS, STICKER_REACTIONS, SANGWOO_MINESWEEPER_WIN_MESSAGE } from './apps/messengerStory';
import {
  GRID_SIZE,
  TOTAL_MINES,
  createEmptyBoard,
  populateMinesAfterFirstClick,
  revealCellOnBoard,
  formatCipherProgress,
  getNeighbors,
} from './apps/minesweeperLogic';
import { getUtc10TimeSnapshot } from '../utils/timeZoneUtils';
import { PAGE_0_APPS, PAGE_1_APPS } from './home/homeAppsData';

test('formatTrackTime formats seconds into m:ss accurately', () => {
  assert.equal(formatTrackTime(0), '0:00');
  assert.equal(formatTrackTime(5), '0:05');
  assert.equal(formatTrackTime(65), '1:05');
  assert.equal(formatTrackTime(125.9), '2:05');
  assert.equal(formatTrackTime(NaN), '0:00');
  assert.equal(formatTrackTime(-10), '0:00');
});

test('clampProgressPercent bounds progress between 0 and 100', () => {
  assert.equal(clampProgressPercent(0, 0), 0);
  assert.equal(clampProgressPercent(30, 120), 25);
  assert.equal(clampProgressPercent(150, 120), 100);
  assert.equal(clampProgressPercent(-5, 120), 0);
});

test('getUtc10TimeSnapshot computes UTC+10 time, countdown before 2027, and elapsed time in 2027', () => {
  // 2026-12-31T14:00:05Z is 2027-01-01 00:00:05 in UTC+10
  const exactMidnightUtc10 = new Date(Date.UTC(2026, 11, 31, 14, 0, 5));
  const snap = getUtc10TimeSnapshot(exactMidnightUtc10);
  assert.equal(snap.hm, '00:00');
  assert.equal(snap.hms, '00:00:05');
  assert.equal(snap.isNewYearReached, true);
  assert.equal(snap.elapsedIn2027Hms, '00:00:05');

  // 2026-12-30T14:00:00Z is 2026-12-31 00:00:00 in UTC+10 (1 day before 2027)
  const dayBeforeUtc10 = new Date(Date.UTC(2026, 11, 30, 14, 0, 0));
  const beforeSnap = getUtc10TimeSnapshot(dayBeforeUtc10);
  assert.equal(beforeSnap.isNewYearReached, false);
  assert.equal(beforeSnap.countdown.days, 1);
});

test('formatCipherProgress progressively reveals 2nd digit 4 and full cipher 2427 from ????', () => {
  assert.equal(
    formatCipherProgress({
      committeeUnlocked: false,
      notesUnlocked: false,
      minesweeperUnlocked: false,
    }),
    '????'
  );
  assert.equal(
    formatCipherProgress({
      committeeUnlocked: false,
      notesUnlocked: true,
      minesweeperUnlocked: false,
    }),
    '?4??'
  );
  assert.equal(
    formatCipherProgress({
      committeeUnlocked: true,
      notesUnlocked: false,
      minesweeperUnlocked: false,
    }),
    '2?2?'
  );
  assert.equal(
    formatCipherProgress({
      committeeUnlocked: true,
      notesUnlocked: false,
      minesweeperUnlocked: true,
    }),
    '2?27'
  );
  assert.equal(
    formatCipherProgress({
      committeeUnlocked: true,
      notesUnlocked: true,
      minesweeperUnlocked: true,
    }),
    '2427'
  );
});

test('Minesweeper 6x6 board guarantees safe first click and wins when all 32 safe cells are revealed', () => {
  const empty = createEmptyBoard(GRID_SIZE);
  assert.equal(empty.length, 36);

  const firstClickIndex = 14;
  const populated = populateMinesAfterFirstClick(empty, firstClickIndex, TOTAL_MINES, GRID_SIZE);

  const mineCells = populated.filter((c) => c.isMine);
  assert.equal(mineCells.length, TOTAL_MINES);

  // First clicked cell and its neighbors must not contain mines
  assert.equal(populated[firstClickIndex].isMine, false);
  for (const nIdx of getNeighbors(firstClickIndex, GRID_SIZE)) {
    assert.equal(populated[nIdx].isMine, false);
  }

  // Reveal all non-mine cells and verify win condition
  let current = populated;
  let won = false;
  for (const cell of current) {
    if (!cell.isMine && !current[cell.index].isRevealed) {
      const res = revealCellOnBoard(current, cell.index, GRID_SIZE);
      assert.equal(res.hitMine, false);
      current = res.board;
      won = res.won;
    }
  }
  assert.equal(won, true);
});

test('Messenger story threads include Sangwoo Minesweeper challenge and reward', () => {
  assert.equal(THREADS.length, 4);
  assert.ok(STICKER_REACTIONS[1].text.includes('20'));
  const sangwooThread = THREADS.find((t) => t.id === 'sangwoo');
  assert.ok(sangwooThread);
  assert.ok(sangwooThread.messages.some((m) => m.text?.includes('Сапёр')));
  assert.ok(SANGWOO_MINESWEEPER_WIN_MESSAGE.text?.includes('7'));
});

test('Minesweeper app is placed on Page 2 (PAGE_1_APPS) and not Page 1 (PAGE_0_APPS)', () => {
  assert.equal(PAGE_0_APPS.some((a) => a.id === 'minesweeper'), false);
  assert.equal(PAGE_1_APPS.some((a) => a.id === 'minesweeper'), true);
});

test('computeBreachKinematics computes 3-stage vault breach (0-35% Door, 35-70% Gears, 70-100% Lasers)', async () => {
  const { computeBreachKinematics, computeAngleDeltaDeg } = await import('./apps/SafeBreachStage');

  // Stage 1: Outer Vault Door (0% - 35%)
  const at0 = computeBreachKinematics(0);
  assert.equal(at0.activeStage, 1);
  assert.equal(at0.wheelRotationDeg, 0);
  assert.equal(at0.doorSplitProgress, 0);
  assert.equal(at0.activeLasersCount, 9);

  const at35 = computeBreachKinematics(35);
  assert.equal(at35.activeStage, 2);
  assert.equal(at35.wheelRotationDeg, 420);
  assert.equal(at35.doorSplitProgress, 1);

  // Stage 2: Dark-Metal Gears (35% - 70%)
  const at64 = computeBreachKinematics(64);
  assert.equal(at64.activeStage, 2);
  assert.equal(at64.gearsAligned, true);
  assert.equal(at64.gears.length, 21);

  const at70 = computeBreachKinematics(70);
  assert.equal(at70.activeStage, 3);
  assert.equal(at70.gearSplitProgress, 1);

  // Stage 3: Laser Barrier & Cryo-Chamber (70% - 100%)
  const at82 = computeBreachKinematics(82);
  assert.equal(at82.activeStage, 3);
  assert.equal(at82.lasers[0].status, 'off');
  assert.equal(at82.lasers[1].status, 'off');
  assert.equal(at82.lasers[2].status, 'off');
  assert.equal(at82.lasers[3].status, 'glitching');
  assert.equal(at82.allLasersOff, false);

  const at100 = computeBreachKinematics(100);
  assert.equal(at100.activeStage, 3);
  assert.equal(at100.activeLasersCount, 0);
  assert.equal(at100.allLasersOff, true);
  assert.equal(at100.isDoorsOpening, true);

  assert.equal(Math.round(computeAngleDeltaDeg(0, Math.PI / 2)), 90);
});


