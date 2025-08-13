import React from 'react';

/**
 * PUBLIC_INTERFACE
 * ChatBox
 * Displays trash-talk chatbot messages, loading indicator, and error state.
 * Props:
 * - messages: Array<{id: string|number, role: 'assistant', content: string}>
 * - loading: boolean
 * - enabled: boolean
 * - error: string | null
 */
function ChatBox({ messages, loading, enabled, error }) {
  return (
    <section className="chatbox" aria-live="polite">
      <div className="chatbox-header">
        <h3 className="chatbox-title">Chatbot Banter</h3>
        {!enabled && (
          <span className="chatbox-hint" title="Set API key in .env">
            Disabled — set REACT_APP_OPENAI_API_KEY in .env
          </span>
        )}
      </div>

      {error && (
        <div role="alert" className="chat-error">
          {error}
        </div>
      )}

      {loading && (
        <div className="chat-loading" aria-busy="true">
          🤖 Crafting a comeback...
        </div>
      )}

      <ul className="chat-list">
        {messages.length === 0 && !loading && (
          <li className="chat-empty">Make a move to hear some friendly banter!</li>
        )}
        {messages.map((m) => (
          <li key={m.id} className="chat-message">
            {m.content}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default ChatBox;
