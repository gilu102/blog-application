import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { chat as chatApi } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);

  const loadMessages = () => {
    chatApi
      .list()
      .then(({ data }) => setMessages(Array.isArray(data) ? data : data.results ?? []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMessages();
    const t = setInterval(loadMessages, 4000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !user) return;
    chatApi
      .send(input.trim())
      .then(() => {
        setInput("");
        loadMessages();
      })
      .catch((e) => setError(e.response?.data?.content?.[0] || e.message));
  };

  const isOwn = (m) => user && m.user_name === user.username;
  const displayMessages = messages.slice().reverse();

  if (loading && messages.length === 0) {
    return (
      <div className="chat-room">
        <div className="chat-room-header">
          <span className="chat-room-icon">💬</span>
          <h1>Gil's Lounge</h1>
          <p className="chat-room-tagline">הצ'אט של הבלוג · Say hi, share ideas</p>
        </div>
        <div className="chat-loading">
          <span className="chat-loading-dot" />
          <span className="chat-loading-dot" />
          <span className="chat-loading-dot" />
          <p>מתחבר לחדר... Connecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-room">
      <header className="chat-room-header">
        <span className="chat-room-icon">💬</span>
        <div>
          <h1>Gil's Lounge</h1>
          <p className="chat-room-tagline">הצ'אט של הבלוג · Say hi, share ideas ✨</p>
        </div>
        <span className="chat-room-live" title="Updates every few seconds">● Live</span>
      </header>

      {error && <p className="error chat-room-error">{error}</p>}

      <div className="chat-box">
        {displayMessages.length === 0 ? (
          <div className="chat-empty">
            <p className="chat-empty-icon">👋</p>
            <p><strong>אין עדיין הודעות</strong> · No messages yet</p>
            <p>תהיה הראשון לשלוח שלום! Be the first to say hi!</p>
          </div>
        ) : (
          displayMessages.map((m) => (
            <div
              key={m.id}
              className={`chat-msg ${isOwn(m) ? "chat-msg-own" : "chat-msg-other"}`}
            >
              {!isOwn(m) && <span className="chat-msg-author">{m.user_name}</span>}
              <div className="chat-msg-bubble">
                <p className="chat-msg-content">{m.content}</p>
                <span className="chat-msg-time">{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {user ? (
        <form onSubmit={handleSend} className="chat-form">
          <div className="chat-form-inner">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="כתוב הודעה... Type a message..."
              maxLength={500}
              className="chat-input"
              aria-label="Chat message"
            />
            <button type="submit" className="chat-send" title="Send" aria-label="Send message">
              ➤
            </button>
          </div>
          <span className="chat-char-count">{input.length}/500</span>
        </form>
      ) : (
        <div className="chat-login-prompt">
          <p>🔐 <Link to="/login">התחבר</Link> או <Link to="/register">הירשם</Link> כדי לשלוח הודעות · Log in to send messages</p>
        </div>
      )}
    </div>
  );
}
