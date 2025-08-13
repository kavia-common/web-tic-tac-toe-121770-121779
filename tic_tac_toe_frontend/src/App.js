import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import Board from './components/Board.jsx';
import GameStatus from './components/GameStatus.jsx';
import ChatBox from './components/ChatBox.jsx';
import { calculateWinner, isBoardFull } from './utils/game';
import { getBestMove } from './utils/ai';
import { sendTrashTalk, shouldEnableTrashTalk } from './utils/openai';

// Constants
const EMPTY_BOARD = Array(9).fill(null);

/**
 * PUBLIC_INTERFACE
 * App
 * Top-level component for the Tic Tac Toe game.
 * - Renders a centered minimalistic game layout (light theme).
 * - Human plays as 'X', AI plays as 'O'.
 * - Shows current turn, detects win/tie, and supports restart.
 */
function App() {
  const [squares, setSquares] = useState(EMPTY_BOARD);
  const [currentPlayer, setCurrentPlayer] = useState('X'); // X: Human, O: AI
  const [{ winner, line: winningLine }, setWinnerInfo] = useState({ winner: null, line: null });
  const [isTie, setIsTie] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const aiTimeoutRef = useRef(null);

  // Chatbot state
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState(null);
  const [chatEnabled, setChatEnabled] = useState(false);

  useEffect(() => {
    setChatEnabled(shouldEnableTrashTalk());
  }, []);

  // Handle AI turn automatically
  useEffect(() => {
    if (winner || isTie) return;

    if (currentPlayer === 'O') {
      setIsAiThinking(true);
      // Slight delay to simulate thinking and allow UI update
      aiTimeoutRef.current = setTimeout(() => {
        const idx = getBestMove([...squares], 'O', 'X');
        if (idx !== null && squares[idx] === null) {
          const next = [...squares];
          next[idx] = 'O';
          const { winner: newWinner, line } = calculateWinner(next);
          setSquares(next);

          const tieNow = !newWinner && isBoardFull(next);
          // Fire off chatbot banter for AI move
          triggerTrashTalk(next, 'O', idx, newWinner, tieNow);

          if (newWinner) {
            setWinnerInfo({ winner: newWinner, line });
            setIsAiThinking(false);
            return;
          }
          if (tieNow) {
            setIsTie(true);
            setIsAiThinking(false);
            return;
          }
          setCurrentPlayer('X');
          setIsAiThinking(false);
        } else {
          // No move possible - treat as tie for safety
          setIsTie(true);
          setIsAiThinking(false);
        }
      }, 400);
    }

    return () => {
      if (aiTimeoutRef.current) {
        clearTimeout(aiTimeoutRef.current);
        aiTimeoutRef.current = null;
      }
    };
  }, [currentPlayer, squares, winner, isTie]);

  /**
   * PUBLIC_INTERFACE
   * handleSquareClick
   * Processes human player's move on a given index.
   * @param {number} index - Cell index clicked by human player
   */
  const handleSquareClick = (index) => {
    if (winner || isTie) return;
    if (isAiThinking) return;         // Prevent clicks during AI move
    if (squares[index] !== null) return;

    const next = [...squares];
    next[index] = 'X';

    const { winner: newWinner, line } = calculateWinner(next);
    setSquares(next);

    const tieNow = !newWinner && isBoardFull(next);
    // Fire off chatbot banter for human move
    triggerTrashTalk(next, 'X', index, newWinner, tieNow);

    if (newWinner) {
      setWinnerInfo({ winner: newWinner, line });
      return;
    }

    if (tieNow) {
      setIsTie(true);
      return;
    }

    setCurrentPlayer('O');
  };

  /**
   * PUBLIC_INTERFACE
   * restartGame
   * Resets the game to its initial state.
   */
  const restartGame = () => {
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current);
      aiTimeoutRef.current = null;
    }
    setSquares(EMPTY_BOARD);
    setCurrentPlayer('X');
    setWinnerInfo({ winner: null, line: null });
    setIsTie(false);
    setIsAiThinking(false);
    // Reset chat state
    setChatMessages([]);
    setChatError(null);
    setChatLoading(false);
  };

  /**
   * PUBLIC_INTERFACE
   * triggerTrashTalk
   * Sends a banter request to the OpenAI API if enabled; manages loading and errors.
   * @param {Array<('X'|'O'|null)>} board - new board AFTER the move
   * @param {'X'|'O'} player - who made the move
   * @param {number} index - index of the move just played
   * @param {'X'|'O'|null} newWinner - winner after the move (if any)
   * @param {boolean} tieNow - whether the board is now a tie
   */
  const triggerTrashTalk = async (board, player, index, newWinner, tieNow) => {
    if (!chatEnabled) return;
    try {
      setChatLoading(true);
      setChatError(null);
      const message = await sendTrashTalk(board, player, index, {
        winner: newWinner,
        tie: Boolean(tieNow),
      });
      setChatMessages((prev) => [
        { id: Date.now() + Math.random(), role: 'assistant', content: message },
        ...prev,
      ].slice(0, 20));
    } catch (err) {
      setChatError(err?.message || 'Chatbot failed to respond.');
    } finally {
      setChatLoading(false);
    }
  };

  const interactionsDisabled = Boolean(winner || isTie || isAiThinking);

  return (
    <div className="App">
      <main className="game-container">
        <header className="game-header">
          <h1 className="title">Tic Tac Toe</h1>
          <p className="subtitle">Minimal, responsive, and smart.</p>
        </header>

        <GameStatus
          winner={winner}
          isTie={isTie}
          currentPlayer={currentPlayer}
          isAiThinking={isAiThinking}
        />

        <Board
          squares={squares}
          onCellClick={handleSquareClick}
          winningLine={winningLine}
          disabled={interactionsDisabled}
        />

        <div className="controls">
          <button
            type="button"
            className="btn btn-primary btn-reset-font"
            onClick={restartGame}
            aria-label="Restart game"
          >
            Reset
          </button>
        </div>

        <ChatBox
          messages={chatMessages}
          loading={chatLoading}
          enabled={chatEnabled}
          error={chatError}
        />
      </main>
    </div>
  );
}

export default App;
