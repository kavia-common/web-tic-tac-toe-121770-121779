import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Square
 * Single game cell button. Accessible, responsive, and color-coded per mark.
 * Props:
 * - index: number - cell index (0..8)
 * - value: 'X' | 'O' | null - content of the cell
 * - highlight: boolean - whether this cell is part of the winning line
 * - disabled: boolean - whether the button is disabled
 * - onClick: () => void - click handler
 */
function Square({ index, value, highlight, disabled, onClick }) {
  const classes = ['square'];
  if (value === 'X') classes.push('mark-x');
  if (value === 'O') classes.push('mark-o');
  if (highlight) classes.push('win');

  return (
    <button
      type="button"
      className={classes.join(' ')}
      onClick={onClick}
      disabled={disabled}
      aria-label={`Cell ${index + 1}${value ? ` with ${value}` : ''}`}
      role="gridcell"
      data-testid={`square-${index}`}
    >
      {value}
    </button>
  );
}

export default Square;
