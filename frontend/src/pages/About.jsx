import { Link } from "react-router-dom";

const CV_PATH = "/cv/Gil_CV.docx";

export default function About() {
  return (
    <div className="container">
      <h1 className="about-title">אודות / About Me</h1>
      <section className="about-section">
        <h2>גיל מזור · Gil Mazor</h2>
        <p>
          ברוכים הבאים לבלוג שלי. כאן תמצאו מאמרים, מחשבות ועדכונים.
          <br />
          Welcome to my blog. Here you'll find articles, thoughts, and updates.
        </p>
        <div className="about-contact">
          <p>
            <strong>טלפון / Phone:</strong>{" "}
            <a href="tel:0538817404">053-881-7404</a>
          </p>
          <p>
            <strong>אימייל / Email:</strong>{" "}
            <a href="mailto:gilmazor1@outlook.com">gilmazor1@outlook.com</a>
          </p>
          <p>
            <Link to="/chat">צ'אט עם המנהל / Chat with the admin</Link>
          </p>
        </div>
        <div className="about-cv">
          <h3>קורות חיים / CV</h3>
          <p>
            <a href={CV_PATH} download className="btn-primary">
              הורד קורות חיים (Word) / Download CV (DOCX)
            </a>
          </p>
          <p className="meta">
            קובץ: קורות חיים גיל.docx · File: Gil's resume
          </p>
        </div>
      </section>
    </div>
  );
}
