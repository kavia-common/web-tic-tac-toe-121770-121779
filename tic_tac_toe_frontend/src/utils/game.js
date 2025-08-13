 /**
  * PUBLIC_INTERFACE
  * calculateWinner
  * Determines the winner of a Tic Tac Toe board.
  * @param {Array<('X'|'O'|null)>} squares - The current board state (length 9).
  * @returns {{winner: ('X'|'O'|null), line: number[]|null}} - Winner and winning line indices if any.
  */
export function calculateWinner(squares) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
    [0, 4, 8], [2, 4, 6],            // Diagonals
  ];

  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: [a, b, c] };
    }
  }
  return { winner: null, line: null };
}

/**
 * PUBLIC_INTERFACE
 * isBoardFull
 * Checks if all cells are filled.
 * @param {Array<('X'|'O'|null)>} squares
 * @returns {boolean}
 */
export function isBoardFull(squares) {
  return squares.every((cell) => cell !== null);
}

/**
 * PUBLIC_INTERFACE
 * getAvailableMoves
 * Returns list of indices of empty cells.
 * @param {Array<('X'|'O'|null)>} squares
 * @returns {number[]}
 */
export function getAvailableMoves(squares) {
  const moves = [];
  for (let i = 0; i < squares.length; i += 1) {
    if (squares[i] === null) moves.push(i);
  }
  return moves;
}
