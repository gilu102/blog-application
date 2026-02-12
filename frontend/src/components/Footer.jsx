import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <p className="footer-signature">Gil Mazor · G.M.</p>
        <div className="footer-contact">
          <a href="tel:0538817404">053-881-7404</a>
          <span className="footer-sep">·</span>
          <a href="mailto:gilmazor1@outlook.com">gilmazor1@outlook.com</a>
        </div>
        <p className="footer-chat">
          <Link to="/chat">Chat with the admin</Link>
        </p>
      </div>
    </footer>
  );
}
