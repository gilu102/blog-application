import { useState } from "react";
import { Link } from "react-router-dom";

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="chatbot-toggle"
        onClick={() => setOpen((o) => !o)}
        title="Chat / Help"
        aria-label="Open chat"
      >
        💬
      </button>
      {open && (
        <div className="chatbot-panel">
          <div className="chatbot-header">
            <span>Gil's Blog · Help</span>
            <button type="button" className="chatbot-close" onClick={() => setOpen(false)} aria-label="Close">×</button>
          </div>
          <div className="chatbot-body">
            <p className="chatbot-welcome">Hi! Need help or want to say hi?</p>
            <p>Use the <Link to="/chat" onClick={() => setOpen(false)}>Chat</Link> page to talk with the admin and the community.</p>
            <p className="chatbot-contact">
              Or contact Gil: <a href="tel:0538817404">053-881-7404</a>, <a href="mailto:gilmazor1@outlook.com">gilmazor1@outlook.com</a>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
