import { useState } from "react";
import { tracking } from "../api/endpoints";

export default function FileSystemTracking() {
  const [email, setEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState("");
  const [verifySent, setVerifySent] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [robotChecked, setRobotChecked] = useState(false);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setResetError("");
    setResetSent(false);
    try {
      await tracking.passwordResetRequest(email);
      setResetSent(true);
    } catch (err) {
      setResetError(err.response?.data?.detail || "Request failed.");
    }
  };

  const handleVerifyHuman = async (e) => {
    e.preventDefault();
    if (!robotChecked) return;
    setVerifyError("");
    setVerifySent(false);
    try {
      await tracking.verifyHuman();
      setVerifySent(true);
    } catch (err) {
      setVerifyError(err.response?.data?.detail || "Verification failed.");
    }
  };

  return (
    <div className="container">
      <h1 className="tracking-title">מערכת קבצים ומעקב / File System Tracking</h1>
      <p className="tracking-intro">
        שירותים לאיפוס סיסמה ולאימות שמשתמשים אינם רובוטים. כל פעולה נרשמת למעקב אבטחה.
        <br />
        Password reset and human verification. All actions are logged for security tracking.
      </p>

      <section className="tracking-section">
        <h2>איפוס סיסמה / Password Reset</h2>
        <p className="meta">
          הזן את כתובת האימייל שלך. אם החשבון קיים, תקבל אימייל עם קישור לאיפוס סיסמה (בפיתוח האימייל מופיע בקונסול).
          <br />
          Enter your email. If the account exists, you will receive an email with a reset link (in dev the email is printed in the backend console).
        </p>
        <form onSubmit={handlePasswordReset} className="tracking-form">
          <label>
            אימייל / Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </label>
          <button type="submit" className="btn-primary">
            שלח בקשת איפוס / Request Reset
          </button>
          {resetSent && <p className="success">הבקשה נרשמה. אם החשבון קיים, תקבל הוראות. / Request recorded.</p>}
          {resetError && <p className="error">{resetError}</p>}
        </form>
      </section>

      <section className="tracking-section">
        <h2>אימות משתמש (לא רובוט) / Human Verification</h2>
        <p className="meta">
          אשר שאתה לא רובוט. הפעולה נרשמת במערכת המעקב.
          <br />
          Confirm you are not a robot. The action is logged in the tracking system.
        </p>
        <form onSubmit={handleVerifyHuman} className="tracking-form">
          <label className="checkbox-label" htmlFor="human-verify-checkbox">
            <input
              id="human-verify-checkbox"
              type="checkbox"
              checked={robotChecked}
              onChange={(e) => setRobotChecked(e.target.checked)}
              aria-describedby="verify-result"
            />
            אני לא רובוט / I'm not a robot
          </label>
          <button type="submit" className="btn-primary" disabled={!robotChecked}>
            אשר / Verify
          </button>
          <div id="verify-result">
            {verifySent && <p className="success">אימות נרשם. / Verification recorded.</p>}
            {verifyError && <p className="error">{verifyError}</p>}
          </div>
        </form>
      </section>
    </div>
  );
}
