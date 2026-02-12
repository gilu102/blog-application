import { useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { tracking } from "../api/endpoints";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const uid = searchParams.get("uid") || "";
  const token = searchParams.get("token") || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!uid || !token) {
      setError("Invalid or expired reset link. Request a new one from the File System Tracking page.");
      return;
    }
    setLoading(true);
    try {
      await tracking.passwordResetConfirm(uid, token, newPassword);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container">
        <h1>Password reset</h1>
        <p className="success">Password has been reset. Redirecting to login...</p>
        <p><Link to="/login">Log in now</Link></p>
      </div>
    );
  }

  if (!uid || !token) {
    return (
      <div className="container">
        <h1>Reset password</h1>
        <p className="error">Missing or invalid reset link. Please use the link from your email, or <Link to="/file-system-tracking">request a new password reset</Link>.</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Set new password</h1>
      <p className="meta">Enter your new password below.</p>
      <form onSubmit={handleSubmit} className="reset-password-form">
        {error && <p className="error">{error}</p>}
        <label>
          New password
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={8}
            required
            autoComplete="new-password"
            aria-label="New password"
          />
        </label>
        <label>
          Confirm password
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={8}
            required
            autoComplete="new-password"
            aria-label="Confirm password"
          />
        </label>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Resetting..." : "Reset password"}
        </button>
      </form>
      <p><Link to="/login">Back to login</Link></p>
    </div>
  );
}
