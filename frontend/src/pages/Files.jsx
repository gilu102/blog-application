import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { uploadedFiles } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";

export default function Files() {
  const { user, isAdmin } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadName, setUploadName] = useState("");
  const [uploadFile, setUploadFile] = useState(null);

  const loadFiles = () => {
    uploadedFiles
      .list()
      .then(({ data }) => setList(Array.isArray(data) ? data : data.results ?? []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => loadFiles(), []);

  const canDelete = (file) => isAdmin || (file.uploaded_by_username && file.uploaded_by_username === user?.username);

  const handleUpload = (e) => {
    e.preventDefault();
    if (!uploadFile || !user) return;
    setError("");
    setUploading(true);
    const formData = new FormData();
    formData.append("file", uploadFile);
    if (uploadName.trim()) formData.append("name", uploadName.trim());
    uploadedFiles
      .upload(formData)
      .then(() => {
        setUploadName("");
        setUploadFile(null);
        if (e.target.elements.file) e.target.elements.file.value = "";
        loadFiles();
      })
      .catch((err) => setError(err.response?.data?.detail || err.response?.data?.file?.[0] || "Upload failed."))
      .finally(() => setUploading(false));
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this file?")) return;
    uploadedFiles.delete(id).then(() => loadFiles()).catch((err) => setError(err.response?.data?.detail || "Delete failed."));
  };

  return (
    <div className="container">
      <h1>Files &amp; Resources</h1>
      <p className="meta">Shared files and resources from Gil's Blog.</p>

      {user && (
        <form onSubmit={handleUpload} className="files-upload-form">
          <h2>Upload file</h2>
          <label>
            Display name (optional)
            <input type="text" value={uploadName} onChange={(e) => setUploadName(e.target.value)} placeholder="My document" />
          </label>
          <label>
            File
            <input type="file" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} required aria-label="Choose file" />
          </label>
          <button type="submit" className="btn-primary" disabled={uploading}>{uploading ? "Uploading..." : "Upload"}</button>
        </form>
      )}

      {error && <p className="error">{error}</p>}
      {loading && <p>Loading files...</p>}
      {!loading && list.length === 0 && (
        <div className="files-placeholder">
          <p>No files uploaded yet. {user ? "Upload one above." : "Log in to upload."}</p>
          <p><Link to="/chat">Chat with the admin</Link> to request resources.</p>
        </div>
      )}
      {!loading && list.length > 0 && (
        <ul className="files-list">
          {list.map((f) => (
            <li key={f.id} className="files-item">
              <a href={f.file} download target="_blank" rel="noopener noreferrer">{f.name || f.file}</a>
              <span className="meta">{f.uploaded_by_username && `${f.uploaded_by_username} · `}{new Date(f.uploaded_at).toLocaleDateString()}</span>
              {canDelete(f) && (
                <button type="button" className="btn-secondary btn-sm" onClick={() => handleDelete(f.id)}>Delete</button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
