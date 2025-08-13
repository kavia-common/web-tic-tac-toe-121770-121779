import React from 'react';
import Square from './Square';

/**
 * PUBLIC_INTERFACE
 * Board
 * Renders a 3x3 Tic Tac Toe grid and delegates clicks to parent.
 * Props:
 * - squares: string[] | null[] - current board state
 * - onCellClick: (index: number) => void - handler for cell clicks
 * - winningLine: number[] | null - indices of winning combination to highlight
 * - disabled: boolean - disables interactions (e.g., while AI is thinking or game over)
 */
function Board({ squares, onCellClick, winningLine, disabled }) {
  return (
    <div className="board" role="grid" aria-label="Tic Tac Toe board" data-testid="board">
      {squares.map((value, idx) => {
        const isWinning = Array.isArray(winningLine) && winningLine.includes(idx);
        return (
          <Square
            key={idx}
            index={idx}
            value={value}
            disabled={disabled || value !== null}
            highlight={isWinning}
            onClick={() => onCellClick(idx)}
          />
        );
      })}
    </div>
  );
}

export default Board;
