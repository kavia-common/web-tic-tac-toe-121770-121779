import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders title, board with 9 squares and a restart button', () => {
  render(<App />);

  // Title present
  const heading = screen.getByRole('heading', { name: /tic tac toe/i });
  expect(heading).toBeInTheDocument();

  // Board has 9 squares
  const squares = [
    screen.getByTestId('square-0'),
    screen.getByTestId('square-1'),
    screen.getByTestId('square-2'),
    screen.getByTestId('square-3'),
    screen.getByTestId('square-4'),
    screen.getByTestId('square-5'),
    screen.getByTestId('square-6'),
    screen.getByTestId('square-7'),
    screen.getByTestId('square-8'),
  ];
  expect(squares).toHaveLength(9);

  // Restart button present
  const restartBtn = screen.getByRole('button', { name: /restart/i });
  expect(restartBtn).toBeInTheDocument();
});

test('allows human to place X on an empty square', () => {
  render(<App />);
  const firstSquare = screen.getByTestId('square-0');

  // Initially empty
  expect(firstSquare).toHaveTextContent('');

  // Click to place X
  fireEvent.click(firstSquare);
  expect(firstSquare).toHaveTextContent('X');
});
