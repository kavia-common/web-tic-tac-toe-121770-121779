import { calculateWinner, getAvailableMoves } from './game';

/**
 * Score mapping for terminal states from AI ('O') perspective.
 */
const SCORES = {
  O: 1,
  X: -1,
  TIE: 0,
};

/**
 * PUBLIC_INTERFACE
 * getBestMove
 * Computes the optimal move for the AI player ('O') using minimax.
 * @param {Array<('X'|'O'|null)>} squares - Current board state
 * @param {'O'|'X'} aiPlayer - AI player mark (default 'O')
 * @param {'O'|'X'} humanPlayer - Human player mark (default 'X')
 * @returns {number} index of the best move
 */
export function getBestMove(squares, aiPlayer = 'O', humanPlayer = 'X') {
  const result = minimax(squares, aiPlayer, humanPlayer, aiPlayer);
  return result.index;
}

/**
 * Minimax algorithm tailored for Tic Tac Toe.
 * @param {Array<('X'|'O'|null)>} board
 * @param {'O'|'X'} aiPlayer
 * @param {'O'|'X'} humanPlayer
 * @param {'O'|'X'} currentPlayer
 * @returns {{ index: number|null, score: number }}
 */
function minimax(board, aiPlayer, humanPlayer, currentPlayer) {
  const { winner } = calculateWinner(board);
  if (winner) {
    return { index: null, score: SCORES[winner] };
  }

  const available = getAvailableMoves(board);
  if (available.length === 0) {
    return { index: null, score: SCORES.TIE };
  }

  let bestMove = { index: null, score: currentPlayer === aiPlayer ? -Infinity : Infinity };

  for (const idx of available) {
    // Try move
    board[idx] = currentPlayer;

    // Recurse
    const outcome = minimax(board, aiPlayer, humanPlayer, currentPlayer === 'O' ? 'X' : 'O');

    // Undo move
    board[idx] = null;

    // Choose best based on current player
    if (currentPlayer === aiPlayer) {
      // Maximize
      if (outcome.score > bestMove.score) {
        bestMove = { index: idx, score: outcome.score };
      }
    } else {
      // Minimize
      if (outcome.score < bestMove.score) {
        bestMove = { index: idx, score: outcome.score };
      }
    }
  }

  return bestMove;
}
