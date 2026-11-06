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
import { getUtc7TimeSnapshot } from '../utils/timeZoneUtils';
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

test('getUtc7TimeSnapshot computes UTC+7 time and live 2027 forward counter', () => {
  // 2026-12-31T17:00:05Z is 2027-01-01 00:00:05 in UTC+7
  const exactMidnightUtc7 = new Date(Date.UTC(2026, 11, 31, 17, 0, 5));
  const snap = getUtc7TimeSnapshot(exactMidnightUtc7);
  assert.equal(snap.hm, '00:00');
  assert.equal(snap.hms, '00:00:05');
  assert.equal(snap.elapsedIn2027Hms, '00:00:05');
});

test('formatCipherProgress progressively reveals 2027 from ????', () => {
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
      committeeUnlocked: true,
      notesUnlocked: false,
      minesweeperUnlocked: false,
    }),
    '20??'
  );
  assert.equal(
    formatCipherProgress({
      committeeUnlocked: true,
      notesUnlocked: false,
      minesweeperUnlocked: true,
    }),
    '20?7'
  );
  assert.equal(
    formatCipherProgress({
      committeeUnlocked: true,
      notesUnlocked: true,
      minesweeperUnlocked: true,
    }),
    '2027'
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
