const API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * PUBLIC_INTERFACE
 * shouldEnableTrashTalk
 * Indicates if trash talk is enabled (requires API key and not running in test environment).
 * @returns {boolean}
 */
export function shouldEnableTrashTalk() {
  const key = process.env.REACT_APP_OPENAI_API_KEY;
  const isTest = process.env.NODE_ENV === 'test';
  return Boolean(key) && !isTest;
}

/**
 * Convert board array into a compact string representation for the prompt.
 * Example:
 * R1: X|O|.
 * R2: .|X|.
 * R3: O|.|.
 * @param {Array<('X'|'O'|null)>} board
 * @returns {string}
 */
function formatBoard(board) {
  const cell = (v) => (v === null ? '.' : v);
  const rows = [
    `${cell(board[0])}|${cell(board[1])}|${cell(board[2])}`,
    `${cell(board[3])}|${cell(board[4])}|${cell(board[5])}`,
    `${cell(board[6])}|${cell(board[7])}|${cell(board[8])}`,
  ];
  return `R1: ${rows[0]}\nR2: ${rows[1]}\nR3: ${rows[2]}`;
}

/**
 * Convert linear index to 1-based row/col.
 * @param {number} idx
 * @returns {{row:number,col:number}}
 */
function idxToRowCol(idx) {
  return { row: Math.floor(idx / 3) + 1, col: (idx % 3) + 1 };
}

/**
 * Build the user message for OpenAI with context.
 * @param {Array<('X'|'O'|null)>} board
 * @param {'X'|'O'} player
 * @param {number} index
 * @param {{winner: ('X'|'O'|null), tie: boolean}} outcome
 * @returns {string}
 */
function buildUserMessage(board, player, index, outcome) {
  const { row, col } = idxToRowCol(index);
  const boardStr = formatBoard(board);
  const outcomeText = outcome.winner
    ? `${outcome.winner} just won`
    : outcome.tie
      ? 'The board is full (tie)'
      : 'Game continues';
  return [
    `Tic Tac Toe current board:`,
    boardStr,
    ``,
    `Latest move: Player ${player} to row ${row}, col ${col} (index ${index}).`,
    `Outcome: ${outcomeText}.`,
    ``,
    `Please respond with a single playful, witty, family-friendly trash-talk line (<= 20 words).`,
    `No profanity, no personal insults—keep it about the move or the board.`
  ].join('\n');
}

/**
 * Safely extract the assistant content from the OpenAI response.
 * @param {*} data
 * @returns {string}
 */
function extractMessage(data) {
  if (!data || !data.choices || !data.choices.length) return '';
  const msg = data.choices[0]?.message?.content ?? '';
  return (msg || '').trim();
}

/**
 * PUBLIC_INTERFACE
 * sendTrashTalk
 * Sends the game context to OpenAI and returns a playful "trash talk" line.
 * Throws an Error if the request fails or is disabled.
 * @param {Array<('X'|'O'|null)>} board
 * @param {'X'|'O'} player
 * @param {number} index
 * @param {{winner: ('X'|'O'|null), tie: boolean}} outcome
 * @returns {Promise<string>}
 */
export async function sendTrashTalk(board, player, index, outcome) {
  const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
  const isTest = process.env.NODE_ENV === 'test';

  // If disabled or running in tests, short-circuit to avoid network
  if (!apiKey) {
    throw new Error('OpenAI API key not configured. Set REACT_APP_OPENAI_API_KEY in .env.');
  }
  if (isTest) {
    return 'Test mode banter: nice move... or was it?';
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    const body = {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'You are a witty, PG-rated trash-talker for a Tic Tac Toe game. Be playful and positive. ' +
            'One or two very short lines, family-friendly, no profanity, no harassment, and avoid personal insults.'
        },
        {
          role: 'user',
          content: buildUserMessage(board, player, index, outcome)
        }
      ],
      max_tokens: 64,
      temperature: 0.9,
    };

    const resp = await fetch(API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      let errDetail = '';
      try {
        const json = await resp.json();
        errDetail = json?.error?.message || '';
      } catch {
        // ignore parse error
      }
      if (resp.status === 429) {
        throw new Error('Rate limited by OpenAI. Please wait a moment and try again.');
      }
      if (resp.status === 401) {
        throw new Error('Unauthorized: Invalid OpenAI API key.');
      }
      throw new Error(errDetail || `OpenAI request failed with status ${resp.status}.`);
    }

    const data = await resp.json();
    const content = extractMessage(data);
    return content || 'I got nothing… but I’m still watching your moves!';
  } catch (e) {
    if (e.name === 'AbortError') {
      throw new Error('Chatbot took too long to respond. Try another move!');
    }
    throw e;
  } finally {
    clearTimeout(timeoutId);
  }
}
