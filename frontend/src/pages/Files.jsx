import { Link } from "react-router-dom";

export default function Files() {
  return (
    <div className="container">
      <h1>Files &amp; Resources</h1>
      <p className="meta">Shared files and resources from Gil's Blog.</p>
      <div className="files-placeholder">
        <p>No files uploaded yet. Check back later or get in touch.</p>
        <p>
          <Link to="/chat">Chat with the admin</Link> to request resources or ask questions.
        </p>
      </div>
    </div>
  );
}
