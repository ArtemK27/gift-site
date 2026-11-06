import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ChevronLeft, RotateCcw, X } from 'lucide-react';
import {
  GRID_SIZE,
  TOTAL_MINES,
  MineCell,
  createEmptyBoard,
  populateMinesAfterFirstClick,
  revealCellOnBoard,
  getNeighbors,
} from './minesweeperLogic';
import { useSettings } from '../../context/SettingsContext';
import { vibrate, playTapSound, playUnlockSound, playGlitchSound } from '../../utils/haptics';

const MINESWEEPER_STORAGE_KEY = 'ios18_minesweeper_state_v1';

type GameStatus = 'idle' | 'playing' | 'won' | 'lost';

interface StoredMinesweeperState {
  board: MineCell[];
  status: GameStatus;
  elapsed: number;
}

/**
 * Subtle deterministic per-cell weathered scuff marks and micro-scratches
 * so every tile in the 6x6 matrix has tactile, worn slate/concrete character.
 */
const CellScuffOverlay: React.FC<{ index: number; isRevealed: boolean }> = ({
  index,
  isRevealed,
}) => {
  const variant = index % 6;
  const flipX = index % 2 === 1;
  const flipY = Math.floor(index / 6) % 2 === 1;

  return (
    <svg
      viewBox="0 0 60 60"
      fill="none"
      className="pointer-events-none absolute inset-0 w-full h-full"
      style={{
        transform: `scale(${flipX ? -1 : 1}, ${flipY ? -1 : 1})`,
      }}
      aria-hidden="true"
    >
      {/* Corner & edge bevel wear */}
      <path
        d="M1 14 L1 1 L15 1"
        stroke={isRevealed ? '#ffffff' : '#cbd5e1'}
        strokeOpacity={isRevealed ? '0.18' : '0.12'}
        strokeWidth="1.2"
      />
      <path
        d="M59 44 L59 59 L43 59"
        stroke="#000000"
        strokeOpacity={isRevealed ? '0.28' : '0.42'}
        strokeWidth="1.4"
      />

      {/* Variant-specific micro scratches & surface pitting */}
      {variant === 0 && (
        <>
          <path
            d="M10 18L24 9M14 21L22 15"
            stroke="#cbd5e1"
            strokeOpacity={isRevealed ? '0.22' : '0.14'}
            strokeWidth="0.75"
            strokeLinecap="round"
          />
          <circle cx="46" cy="42" r="1.1" fill="#000000" fillOpacity="0.25" />
          <circle cx="16" cy="48" r="0.8" fill="#cbd5e1" fillOpacity="0.14" />
        </>
      )}
      {variant === 1 && (
        <>
          <path
            d="M36 12L51 24M41 11L49 18"
            stroke="#cbd5e1"
            strokeOpacity={isRevealed ? '0.2' : '0.13'}
            strokeWidth="0.75"
            strokeLinecap="round"
          />
          <path
            d="M9 43L21 51"
            stroke="#000000"
            strokeOpacity="0.28"
            strokeWidth="0.85"
            strokeLinecap="round"
          />
          <circle cx="14" cy="15" r="0.9" fill="#cbd5e1" fillOpacity="0.15" />
        </>
      )}
      {variant === 2 && (
        <>
          <path
            d="M12 46L31 32M18 48L29 39"
            stroke="#cbd5e1"
            strokeOpacity={isRevealed ? '0.22' : '0.13'}
            strokeWidth="0.7"
            strokeLinecap="round"
          />
          <circle cx="44" cy="14" r="1.2" fill="#000000" fillOpacity="0.24" />
          <circle cx="48" cy="18" r="0.7" fill="#cbd5e1" fillOpacity="0.14" />
        </>
      )}
      {variant === 3 && (
        <>
          <path
            d="M8 26L22 14"
            stroke="#000000"
            strokeOpacity="0.3"
            strokeWidth="0.9"
            strokeLinecap="round"
          />
          <path
            d="M38 47L52 36M43 49L53 41"
            stroke="#cbd5e1"
            strokeOpacity={isRevealed ? '0.22' : '0.14'}
            strokeWidth="0.75"
            strokeLinecap="round"
          />
        </>
      )}
      {variant === 4 && (
        <>
          <path
            d="M28 9L44 17M33 8L42 13"
            stroke="#cbd5e1"
            strokeOpacity={isRevealed ? '0.2' : '0.12'}
            strokeWidth="0.7"
            strokeLinecap="round"
          />
          <path
            d="M11 35L25 48"
            stroke="#000000"
            strokeOpacity="0.26"
            strokeWidth="0.8"
            strokeLinecap="round"
          />
          <circle cx="47" cy="46" r="1" fill="#cbd5e1" fillOpacity="0.14" />
        </>
      )}
      {variant === 5 && (
        <>
          <path
            d="M15 12L32 23"
            stroke="#000000"
            strokeOpacity="0.26"
            strokeWidth="0.8"
            strokeLinecap="round"
          />
          <path
            d="M34 49L50 38M39 51L51 43"
            stroke="#cbd5e1"
            strokeOpacity={isRevealed ? '0.22' : '0.14'}
            strokeWidth="0.75"
            strokeLinecap="round"
          />
          <circle cx="12" cy="47" r="1.1" fill="#000000" fillOpacity="0.24" />
        </>
      )}
    </svg>
  );
};

/**
 * Crimson gothic cross / dagger marker (†) matching the reference design.
 */
const CrimsonCrossMarker: React.FC<{ className?: string }> = ({
  className = 'w-6 h-7',
}) => (
  <svg
    viewBox="0 0 24 30"
    fill="none"
    className={`${className} drop-shadow-[0_0_6px_rgba(220,38,38,0.55)]`}
    aria-hidden="true"
  >
    {/* Vertical blade/shaft with pointed tip and diamond pommel */}
    <path
      d="M12 2L14 5L13.2 23L14.5 25L12 28.5L9.5 25L10.8 23L10 5L12 2Z"
      fill="#cf3434"
    />
    {/* Horizontal crossguard with flared ends */}
    <path
      d="M4 9.5L7 8.2H17L20 9.5L17 10.8H7L4 9.5Z"
      fill="#e04343"
    />
    {/* Subtle center highlight */}
    <line x1="12" y1="3.5" x2="12" y2="26" stroke="#fca5a5" strokeOpacity="0.45" strokeWidth="0.9" />
  </svg>
);

export const MinesweeperApp: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { unlockQuestStep } = useSettings();

  const loadStoredGame = (): StoredMinesweeperState => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = window.localStorage.getItem(MINESWEEPER_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed.board) && parsed.board.length === GRID_SIZE * GRID_SIZE) {
            return {
              board: parsed.board,
              status: parsed.status || 'idle',
              elapsed: typeof parsed.elapsed === 'number' ? parsed.elapsed : 0,
            };
          }
        }
      } catch {
        // Fallback to fresh board
      }
    }
    return {
      board: createEmptyBoard(GRID_SIZE),
      status: 'idle',
      elapsed: 0,
    };
  };

  const initial = loadStoredGame();
  const [board, setBoard] = useState<MineCell[]>(initial.board);
  const [status, setStatus] = useState<GameStatus>(initial.status);
  const [flagMode, setFlagMode] = useState(false);
  const [elapsed, setElapsed] = useState<number>(initial.elapsed);

  // Persist board state across reloads until reset in Settings
  useEffect(() => {
    try {
      const payload: StoredMinesweeperState = { board, status, elapsed };
      window.localStorage.setItem(MINESWEEPER_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage errors
    }
  }, [board, status, elapsed]);

  // Timer while playing
  useEffect(() => {
    if (status !== 'playing') return;
    const interval = setInterval(() => {
      setElapsed((prev) => Math.min(3599, prev + 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  const handleNewGame = useCallback(() => {
    vibrate(18);
    playTapSound(480, 0.04);
    setBoard(createEmptyBoard(GRID_SIZE));
    setStatus('idle');
    setElapsed(0);
    setFlagMode(false);
  }, []);

  useEffect(() => {
    const onReset = () => {
      setBoard(createEmptyBoard(GRID_SIZE));
      setStatus('idle');
      setElapsed(0);
      setFlagMode(false);
      try {
        window.localStorage.removeItem(MINESWEEPER_STORAGE_KEY);
      } catch {}
    };
    window.addEventListener('ios18_quest_reset', onReset);
    return () => window.removeEventListener('ios18_quest_reset', onReset);
  }, []);

  const triggerWinCelebration = useCallback(() => {
    vibrate([40, 80, 140]);
    playUnlockSound();
    unlockQuestStep('minesweeper');
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#e2e8f0', '#94a3b8', '#ef4444', '#ffffff'],
    });
  }, [unlockQuestStep]);

  const toggleFlag = (index: number) => {
    if (status === 'won' || status === 'lost') return;
    const cell = board[index];
    if (!cell || cell.isRevealed) return;

    vibrate(15);
    playTapSound(620, 0.04);
    setBoard((prev) =>
      prev.map((c, idx) => (idx === index ? { ...c, isFlagged: !c.isFlagged } : c))
    );
  };

  const handleCellAction = (index: number) => {
    if (status === 'won' || status === 'lost') return;
    const currentCell = board[index];
    if (!currentCell) return;

    if (flagMode) {
      toggleFlag(index);
      return;
    }

    if (currentCell.isFlagged) return;

    // Chord convenience: tapping an already revealed numbered cell when adjacent flags match
    if (currentCell.isRevealed && currentCell.neighborMines > 0) {
      const neighbors = getNeighbors(index, GRID_SIZE);
      const flaggedCount = neighbors.filter((nIdx) => board[nIdx].isFlagged).length;
      if (flaggedCount === currentCell.neighborMines) {
        let nextBoard = board;
        let hitMine = false;
        let won = false;
        for (const nIdx of neighbors) {
          if (!nextBoard[nIdx].isRevealed && !nextBoard[nIdx].isFlagged) {
            const res = revealCellOnBoard(nextBoard, nIdx, GRID_SIZE);
            nextBoard = res.board;
            if (res.hitMine) hitMine = true;
            if (res.won) won = true;
          }
        }
        setBoard(nextBoard);
        if (hitMine) {
          vibrate([70, 60, 90]);
          playGlitchSound();
          setStatus('lost');
        } else if (won) {
          setStatus('won');
          triggerWinCelebration();
        } else {
          vibrate(12);
          playTapSound(540, 0.04);
        }
      }
      return;
    }

    if (currentCell.isRevealed) return;

    let workingBoard = board;
    if (status === 'idle') {
      workingBoard = populateMinesAfterFirstClick(board, index, TOTAL_MINES, GRID_SIZE);
      setStatus('playing');
    }

    const result = revealCellOnBoard(workingBoard, index, GRID_SIZE);
    setBoard(result.board);

    if (result.hitMine) {
      vibrate([70, 60, 90]);
      playGlitchSound();
      setStatus('lost');
    } else if (result.won) {
      setStatus('won');
      triggerWinCelebration();
    } else {
      vibrate(12);
      playTapSound(540, 0.04);
    }
  };

  const flagsCount = board.filter((c) => c.isFlagged).length;
  const minesRemaining = Math.max(0, TOTAL_MINES - flagsCount);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? `0${m}` : m}:${s < 10 ? `0${s}` : s}`;
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-[#07080c] text-white select-none z-30 overflow-hidden font-mono">
      {/* Subtle Eerie Snow Dust in Background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(circle at 18% 22%, rgba(226,232,240,0.45) 1px, transparent 1.5px), radial-gradient(circle at 82% 16%, rgba(226,232,240,0.35) 1.5px, transparent 2px), radial-gradient(circle at 68% 78%, rgba(226,232,240,0.4) 1px, transparent 1.5px), radial-gradient(circle at 24% 84%, rgba(226,232,240,0.3) 1.5px, transparent 2px)',
          backgroundSize: '180px 180px',
        }}
      />

      {/* Minimalist Top Bar (No Spoilers) */}
      <header className="relative z-20 flex items-center justify-between px-3.5 py-2.5 border-b border-white/10 bg-[#090b10]/90 backdrop-blur-md font-sans">
        <button
          type="button"
          onClick={() => {
            vibrate(15);
            playTapSound(420, 0.04);
            onBack();
          }}
          aria-label="Назад из Сапёра"
          className="flex items-center gap-1 text-zinc-300 hover:text-white active:scale-95 transition-all py-1 px-1.5 -ml-1 rounded-lg"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
          <span className="text-sm font-medium">Назад</span>
        </button>

        <span className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-300">
          САПЁР • СЕКТОР 6x6
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleNewGame}
            aria-label="Новая партия"
            title="Перезапустить сектор"
            className="w-7 h-7 rounded-lg bg-white/[0.06] hover:bg-white/12 active:scale-90 border border-white/10 flex items-center justify-center text-zinc-300 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              vibrate(15);
              playTapSound(400, 0.04);
              onBack();
            }}
            aria-label="Закрыть сапёр"
            className="w-7 h-7 rounded-lg bg-white/[0.06] hover:bg-white/12 active:scale-90 border border-white/10 flex items-center justify-center text-zinc-300 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 pt-2.5 pb-7 flex flex-col items-center justify-between gap-2 overscroll-contain touch-pan-y">
        {/* Top Tactical HUD Box & Mode Switcher */}
        <div className="w-full max-w-[338px] space-y-2">
          {/* HUD Panel: МИНЫ / СЕКТОР / ВРЕМЯ */}
          <div className="w-full rounded-lg bg-[#0d0f15]/95 border border-white/20 px-4 py-2 flex items-center justify-between shadow-[0_8px_24px_rgba(0,0,0,0.65)]">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-400">
                МИНЫ:
              </div>
              <div className="text-xl font-bold text-[#e05252] leading-tight mt-0.5">
                0{minesRemaining}
              </div>
            </div>

            <div className="text-center">
              <div className="text-[11px] uppercase tracking-wider text-slate-400">
                СЕКТОР:
              </div>
              <div className="text-xl font-bold text-white leading-tight mt-0.5">
                6x6
              </div>
            </div>

            <div className="text-right">
              <div className="text-[11px] uppercase tracking-wider text-slate-400">
                ВРЕМЯ:
              </div>
              <div className="text-xl font-bold text-[#e05252] leading-tight mt-0.5">
                {formatTimer(elapsed)}
              </div>
            </div>
          </div>

          {/* Tactical Bracket Mode Switcher: [ ВЗЛОМ СЕКТОРА ] vs [ МЕТКА (†) ] */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              data-testid="minesweeper-mode-dig"
              onClick={() => {
                vibrate(10);
                playTapSound(500, 0.03);
                setFlagMode(false);
              }}
              className={`py-2 px-2 rounded-lg text-xs font-mono font-bold tracking-wider transition-all border ${
                !flagMode
                  ? 'bg-[#161922] text-white border-[#c84b4b] shadow-[0_0_12px_rgba(200,75,75,0.25),inset_0_0_8px_rgba(200,75,75,0.12)]'
                  : 'bg-[#0e1017] text-slate-400 border-white/15 hover:text-slate-200'
              }`}
            >
              [ ВЗЛОМ СЕКТОРА ]
            </button>

            <button
              type="button"
              data-testid="minesweeper-mode-flag"
              onClick={() => {
                vibrate(10);
                playTapSound(520, 0.03);
                setFlagMode(true);
              }}
              className={`py-2 px-2 rounded-lg text-xs font-mono font-bold tracking-wider transition-all border ${
                flagMode
                  ? 'bg-[#161922] text-white border-[#c84b4b] shadow-[0_0_12px_rgba(200,75,75,0.25),inset_0_0_8px_rgba(200,75,75,0.12)]'
                  : 'bg-[#0e1017] text-slate-400 border-white/15 hover:text-slate-200'
              }`}
            >
              [ МЕТКА (<span className="text-[#e05252]">†</span>) ]
            </button>
          </div>
        </div>

        {/* Dense Tactile 6x6 Matrix with Natural Border Snowdrifts & Weathered Tiles */}
        <motion.div
          animate={status === 'lost' ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
          transition={{ duration: 0.35 }}
          data-testid="minesweeper-grid"
          className="relative w-full max-w-[338px] aspect-square p-[4px] bg-[#090b10] border border-white/20 rounded-[4px] shadow-[0_18px_45px_rgba(0,0,0,0.85)] grid grid-cols-6 grid-rows-6 gap-[3px]"
        >
          {board.map((cell) => {
            const isRevealed = cell.isRevealed;
            const isMine = cell.isMine;
            const isFlagged = cell.isFlagged;

            return (
              <button
                key={cell.index}
                type="button"
                data-testid={`mine-cell-${cell.index}`}
                onClick={() => handleCellAction(cell.index)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  toggleFlag(cell.index);
                }}
                aria-label={`Клетка ${cell.row + 1}-${cell.col + 1}`}
                style={{
                  backgroundImage: isRevealed
                    ? isMine
                      ? undefined
                      : 'radial-gradient(circle at 25% 22%, rgba(255,255,255,0.12), transparent 58%), radial-gradient(circle at 78% 82%, rgba(0,0,0,0.28), transparent 62%)'
                    : 'radial-gradient(circle at 24% 20%, rgba(255,255,255,0.045), transparent 55%), radial-gradient(circle at 80% 84%, rgba(0,0,0,0.5), transparent 65%)',
                }}
                className={`relative rounded-[2px] font-mono flex items-center justify-center transition-colors select-none overflow-hidden ${
                  isRevealed
                    ? isMine
                      ? 'bg-[#3a161b] border border-[#e05252]/70 text-[#fca5a5]'
                      : 'bg-[#5a606b] border border-[#262a33] shadow-[inset_0_1px_4px_rgba(0,0,0,0.5)]'
                    : 'bg-[#171a21] hover:bg-[#1f232c] active:bg-[#242934] border border-white/[0.11] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
                }`}
              >
                {/* Per-Cell Weathered Scuff Marks & Micro-Scratches */}
                <CellScuffOverlay index={cell.index} isRevealed={isRevealed} />

                {/* Flagged: Crimson Gothic Cross (†) */}
                {!isRevealed && isFlagged && <CrimsonCrossMarker className="w-6 h-7 relative z-10" />}

                {/* Revealed Mine */}
                {isRevealed && isMine && (
                  <span className="text-lg font-black text-[#ef4444] drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] relative z-10">
                    ✦
                  </span>
                )}

                {/* Revealed Number (Dark Etched Concrete Style) */}
                {isRevealed && !isMine && cell.neighborMines > 0 && (
                  <span
                    className="text-[26px] font-mono font-bold text-[#0c0e13] leading-none select-none relative z-10"
                    style={{
                      textShadow: '0 1px 0 rgba(255,255,255,0.24)',
                    }}
                  >
                    {cell.neighborMines}
                  </span>
                )}
              </button>
            );
          })}

          {/* Physically Grounded Snowdrifts & Corner Rime Frost Overlay */}
          <svg
            viewBox="0 0 360 360"
            fill="none"
            className="pointer-events-none absolute inset-0 w-full h-full z-20"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="snow-cap-grad" x1="0" y1="0" x2="0" y2="20" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="65%" stopColor="#e2e8f0" />
                <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.85" />
              </linearGradient>
              <radialGradient id="frost-corner-tl" cx="0" cy="0" r="0.35">
                <stop offset="0%" stopColor="#f8fafc" stopOpacity="0.38" />
                <stop offset="55%" stopColor="#cbd5e1" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#94a3b8" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="frost-corner-br" cx="1" cy="1" r="0.32">
                <stop offset="0%" stopColor="#f8fafc" stopOpacity="0.35" />
                <stop offset="55%" stopColor="#cbd5e1" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#94a3b8" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="frost-corner-bl" cx="0" cy="1" r="0.26">
                <stop offset="0%" stopColor="#f8fafc" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#94a3b8" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Soft Hoarfrost Corner Vignettes */}
            <rect x="0" y="0" width="130" height="110" fill="url(#frost-corner-tl)" />
            <rect x="230" y="240" width="130" height="120" fill="url(#frost-corner-br)" />
            <rect x="0" y="250" width="100" height="110" fill="url(#frost-corner-bl)" />

            {/* 1. Top-Left Natural Snowdrift Settled Along Top Frame Ledge */}
            <path
              d="M0 0 H108 C102 5 93 7 82 6.5 C69 6 58 11 43 10.5 C27 10 15 15 0 18 Z"
              fill="url(#snow-cap-grad)"
            />
            <path
              d="M0 0 H96 C88 3.5 76 4.5 64 4 C48 3.5 34 7.5 18 8 C9 8.5 4 11 0 12 Z"
              fill="#ffffff"
            />
            {/* Top-Right Smaller Snow Ledge Drift */}
            <path
              d="M276 0 H360 V13 C346 11 335 7 321 7.5 C304 8 290 4.5 276 0 Z"
              fill="url(#snow-cap-grad)"
            />
            <path
              d="M286 0 H360 V8 C348 7 336 4.5 322 4.5 C308 4.5 296 2.5 286 0 Z"
              fill="#ffffff"
            />

            {/* 2. Bottom-Right Corner Settled Snow Bank */}
            <path
              d="M288 360 C298 353 311 352 324 350 C338 348 349 341 360 332 V360 H288 Z"
              fill="#cbd5e1"
              fillOpacity="0.9"
            />
            <path
              d="M298 360 C308 355 320 354 332 352 C344 350 353 345 360 339 V360 H298 Z"
              fill="#f8fafc"
            />

            {/* 3. Bottom-Left Corner Frost & Snow Pocket */}
            <path
              d="M0 334 C7 342 16 348 28 352 C40 355 51 356 62 360 H0 V334 Z"
              fill="#cbd5e1"
              fillOpacity="0.88"
            />
            <path
              d="M0 341 C6 347 15 352 26 355 C36 357 45 358 54 360 H0 V341 Z"
              fill="#f8fafc"
            />

            {/* 4. Delicate Crystalline Frost Needles Along Frame Edges */}
            <path
              d="M2 18 L14 29 M2 26 L9 33 M18 9 L26 19"
              stroke="#e2e8f0"
              strokeOpacity="0.45"
              strokeWidth="0.9"
              strokeLinecap="round"
            />
            <path
              d="M358 332 L345 321 M358 324 L350 317 M341 348 L332 339"
              stroke="#e2e8f0"
              strokeOpacity="0.42"
              strokeWidth="0.9"
              strokeLinecap="round"
            />
            {/* Fine Ice Scratches on Frame Corners */}
            <path
              d="M222 46L242 22M228 48L245 28"
              stroke="#cbd5e1"
              strokeOpacity="0.28"
              strokeWidth="0.8"
              strokeLinecap="round"
            />
            <path
              d="M42 222L60 198M47 224L62 204"
              stroke="#cbd5e1"
              strokeOpacity="0.25"
              strokeWidth="0.8"
              strokeLinecap="round"
            />
          </svg>
        </motion.div>

        {/* Bottom System Notification Area (No Spoiler Until Won!) */}
        <div className="w-full max-w-[338px] min-h-[64px] flex items-center">
          <AnimatePresence mode="wait">
            {status === 'won' ? (
              <motion.div
                key="won-system-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                data-testid="minesweeper-win-banner"
                className="w-full p-3 rounded-xl bg-[#1a1c22]/95 border border-white/20 shadow-[0_12px_30px_rgba(0,0,0,0.8)] font-sans"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-bold text-white tracking-wide">
                    ПодвалГрам • <span className="font-mono text-zinc-300">СИСТЕМА</span>
                  </div>
                  <button
                    type="button"
                    onClick={onBack}
                    className="text-[11px] font-mono text-zinc-400 hover:text-white transition-colors"
                  >
                    [ ЗАКРЫТЬ ]
                  </button>
                </div>
                <div className="text-xs text-zinc-200 mt-1 leading-relaxed font-mono">
                  Перехвачен шифр Сану: «7».
                  <br />
                  Введите его в Сейф.
                </div>
              </motion.div>
            ) : status === 'lost' ? (
              <motion.div
                key="lost-system-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="w-full p-3 rounded-xl bg-[#221215]/95 border border-[#c84b4b]/50 shadow-[0_12px_30px_rgba(0,0,0,0.8)] flex items-center justify-between gap-3 font-mono"
              >
                <div className="text-xs text-rose-200 leading-snug">
                  <div className="font-bold text-[#ef4444]">СЕКТОР ПОВРЕЖДЁН</div>
                  <div className="text-[11px] text-zinc-300 mt-0.5">
                    Сработала мина. Повторите взлом.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleNewGame}
                  className="px-3 py-2 rounded-lg bg-[#c84b4b] hover:bg-[#d95353] active:scale-95 text-xs font-bold text-white shrink-0 transition-all"
                >
                  [ ЗАНОВО ]
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="idle-system-card"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full py-2 px-3 rounded-xl bg-[#0d0f15]/80 border border-white/10 text-center text-[11px] font-mono text-slate-400"
              >
                Взломайте все безопасные сектора (4 мины), чтобы перехватить данные
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default MinesweeperApp;
