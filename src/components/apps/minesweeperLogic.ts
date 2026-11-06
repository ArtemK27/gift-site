export interface MineCell {
  row: number;
  col: number;
  index: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

export interface QuestProgressState {
  committeeUnlocked: boolean;
  notesUnlocked: boolean;
  minesweeperUnlocked: boolean;
}

export const GRID_SIZE = 6;
export const TOTAL_MINES = 4;

/**
 * Formats the 4-digit Safe cipher progressively based on unlocked quest steps.
 * Initial state: "????"
 * Committee sticker -> "20??"
 * Notes clue -> "??2?"
 * Minesweeper win -> "???7"
 * All completed -> "2027"
 */
export function formatCipherProgress(progress: QuestProgressState): string {
  const d1 = progress.committeeUnlocked ? '2' : '?';
  const d2 = progress.committeeUnlocked ? '0' : '?';
  const d3 = progress.notesUnlocked ? '2' : '?';
  const d4 = progress.minesweeperUnlocked ? '7' : '?';
  return `${d1}${d2}${d3}${d4}`;
}

export function createEmptyBoard(size: number = GRID_SIZE): MineCell[] {
  const board: MineCell[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      board.push({
        row: r,
        col: c,
        index: r * size + c,
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0,
      });
    }
  }
  return board;
}

export function getNeighbors(index: number, size: number = GRID_SIZE): number[] {
  const row = Math.floor(index / size);
  const col = index % size;
  const neighbors: number[] = [];

  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
        neighbors.push(nr * size + nc);
      }
    }
  }
  return neighbors;
}

/**
 * Places mines after the first click so the first clicked cell and its immediate
 * neighbors are guaranteed safe, making the 6x6 board fast and enjoyable (15-20s).
 */
export function populateMinesAfterFirstClick(
  initialBoard: MineCell[],
  safeIndex: number,
  mineCount: number = TOTAL_MINES,
  size: number = GRID_SIZE,
  rng: () => number = Math.random
): MineCell[] {
  const board = initialBoard.map((cell) => ({ ...cell }));
  const protectedIndices = new Set<number>([safeIndex, ...getNeighbors(safeIndex, size)]);

  const candidateIndices: number[] = [];
  for (let i = 0; i < board.length; i++) {
    if (!protectedIndices.has(i)) {
      candidateIndices.push(i);
    }
  }

  // Fallback if board is tiny
  if (candidateIndices.length < mineCount) {
    for (let i = 0; i < board.length; i++) {
      if (i !== safeIndex && !candidateIndices.includes(i)) {
        candidateIndices.push(i);
      }
    }
  }

  // Fisher-Yates shuffle with provided rng
  for (let i = candidateIndices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const temp = candidateIndices[i];
    candidateIndices[i] = candidateIndices[j];
    candidateIndices[j] = temp;
  }

  for (let m = 0; m < Math.min(mineCount, candidateIndices.length); m++) {
    board[candidateIndices[m]].isMine = true;
  }

  // Compute neighbor mine counts
  for (let i = 0; i < board.length; i++) {
    if (board[i].isMine) continue;
    const neighbors = getNeighbors(i, size);
    board[i].neighborMines = neighbors.reduce(
      (acc, nIdx) => acc + (board[nIdx].isMine ? 1 : 0),
      0
    );
  }

  return board;
}

/**
 * Reveals a cell and flood-fills any connected 0-mine region.
 */
export function revealCellOnBoard(
  currentBoard: MineCell[],
  targetIndex: number,
  size: number = GRID_SIZE
): { board: MineCell[]; hitMine: boolean; won: boolean } {
  const board = currentBoard.map((cell) => ({ ...cell }));
  const target = board[targetIndex];

  if (!target || target.isFlagged || target.isRevealed) {
    return { board, hitMine: false, won: checkBoardWon(board) };
  }

  if (target.isMine) {
    // Reveal all mines on loss
    for (const cell of board) {
      if (cell.isMine) {
        cell.isRevealed = true;
      }
    }
    return { board, hitMine: true, won: false };
  }

  // BFS flood fill from targetIndex
  const queue: number[] = [targetIndex];
  const visited = new Set<number>([targetIndex]);

  while (queue.length > 0) {
    const currIdx = queue.shift()!;
    const cell = board[currIdx];
    if (!cell.isMine) {
      cell.isRevealed = true;
      cell.isFlagged = false;
    }

    if (cell.neighborMines === 0 && !cell.isMine) {
      for (const nIdx of getNeighbors(currIdx, size)) {
        const neighbor = board[nIdx];
        if (!visited.has(nIdx) && !neighbor.isRevealed && !neighbor.isMine) {
          visited.add(nIdx);
          queue.push(nIdx);
        }
      }
    }
  }

  const won = checkBoardWon(board);
  if (won) {
    // Auto-flag all mines on win
    for (const cell of board) {
      if (cell.isMine) {
        cell.isFlagged = true;
      }
    }
  }

  return { board, hitMine: false, won };
}

export function checkBoardWon(board: MineCell[]): boolean {
  return board.every((cell) => (cell.isMine ? !cell.isRevealed : cell.isRevealed));
}
