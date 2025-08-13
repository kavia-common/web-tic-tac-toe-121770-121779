import React from 'react';

/**
 * PUBLIC_INTERFACE
 * GameStatus
 * Displays current game status: current turn, AI thinking, win, or tie.
 * Props:
 * - winner: 'X' | 'O' | null
 * - isTie: boolean
 * - currentPlayer: 'X' | 'O'
 * - isAiThinking: boolean
 */
function GameStatus({ winner, isTie, currentPlayer, isAiThinking }) {
  let text = '';
  if (winner) {
    text = `${winner} wins!`;
  } else if (isTie) {
    text = "It's a tie.";
  } else if (isAiThinking) {
    text = 'AI is thinking...';
  } else {
    text = `Current Turn: ${currentPlayer}`;
  }

  return (
    <div className="status" aria-live="polite">
      <h2 className="status-text">{text}</h2>
    </div>
  );
}

export default GameStatus;
