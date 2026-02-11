import { useState, useEffect, useRef } from "react";
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

  if (loading && messages.length === 0) return <div className="container">Loading chat...</div>;

  return (
    <div className="container">
      <h1>Chat</h1>
      {error && <p className="error">{error}</p>}
      <div className="chat-box">
        {messages.slice().reverse().map((m) => (
          <div key={m.id} className="chat-msg">
            <strong>{m.user_name}</strong>
            <p className="meta">{new Date(m.created_at).toLocaleString()}</p>
            <p style={{ margin: 0 }}>{m.content}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      {user ? (
        <form onSubmit={handleSend}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            maxLength={500}
            style={{ width: "100%", maxWidth: 400, marginRight: "0.5rem" }}
          />
          <button type="submit" className="btn-primary">Send</button>
        </form>
      ) : (
        <p>Log in to send messages.</p>
      )}
    </div>
  );
}
