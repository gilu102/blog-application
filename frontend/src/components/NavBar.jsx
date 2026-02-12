import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function NavBar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e) => { if (e.key === "Escape") setMobileOpen(false); };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const q = search.trim();
    navigate(q ? `/articles?search=${encodeURIComponent(q)}` : "/articles");
    setMobileOpen(false);
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <nav className={`navbar ${mobileOpen ? "navbar-mobile-open" : ""}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" onClick={closeMobile}>Gil's Blog</Link>
        <form className="navbar-search navbar-search-desktop" onSubmit={handleSearch} role="search">
          <label htmlFor="navbar-search-input" className="visually-hidden">Search articles</label>
          <input
            id="navbar-search-input"
            type="search"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
            aria-label="Search articles"
          />
          <button type="submit" className="btn-primary btn-sm" aria-label="Submit search">Search</button>
        </form>
        <button
          type="button"
          className="navbar-hamburger"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          <span className="navbar-hamburger-bar" />
          <span className="navbar-hamburger-bar" />
          <span className="navbar-hamburger-bar" />
        </button>
        <div className="navbar-links">
          <button type="button" className="navbar-theme-toggle" onClick={toggleTheme} title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"} aria-label="Toggle theme">
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <Link to="/" aria-label="Home page" onClick={closeMobile}>Home</Link>
          <Link to="/about" aria-label="About me" onClick={closeMobile}>About</Link>
          <Link to="/articles" onClick={closeMobile}>Articles</Link>
          {user?.groups?.includes("Admin") || user?.groups?.includes("Editors") ? (
            <Link to="/articles/new" onClick={closeMobile}>New article</Link>
          ) : null}
          <Link to="/chat" onClick={closeMobile}>Chat</Link>
          <Link to="/files" onClick={closeMobile}>Files</Link>
          <Link to="/file-system-tracking" onClick={closeMobile}>File Tracking</Link>
          {user ? (
            <button type="button" onClick={handleLogout} aria-label="Log out">Logout</button>
          ) : (
            <>
              <Link to="/login" onClick={closeMobile}>Login</Link>
              <Link to="/register" onClick={closeMobile}>Register</Link>
            </>
          )}
        </div>
      </div>
      <div className="navbar-mobile-menu" role="dialog" aria-modal="true" aria-label="Navigation menu">
        <div className="navbar-mobile-backdrop" onClick={closeMobile} aria-hidden="true" />
        <div className="navbar-mobile-panel">
        <div className="navbar-mobile-links">
          <button type="button" className="navbar-theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>
          <Link to="/" onClick={closeMobile}>Home</Link>
          <Link to="/about" onClick={closeMobile}>About</Link>
          <Link to="/articles" onClick={closeMobile}>Articles</Link>
          {user?.groups?.includes("Admin") || user?.groups?.includes("Editors") ? (
            <Link to="/articles/new" onClick={closeMobile}>New article</Link>
          ) : null}
          <Link to="/chat" onClick={closeMobile}>Chat</Link>
          <Link to="/files" onClick={closeMobile}>Files</Link>
          <Link to="/file-system-tracking" onClick={closeMobile}>File Tracking</Link>
          {user ? (
            <button type="button" onClick={handleLogout}>Logout</button>
          ) : (
            <>
              <Link to="/login" onClick={closeMobile}>Login</Link>
              <Link to="/register" onClick={closeMobile}>Register</Link>
            </>
          )}
        </div>
        <form className="navbar-search navbar-search-mobile" onSubmit={handleSearch} role="search">
          <input
            type="search"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
            aria-label="Search articles"
          />
          <button type="submit" className="btn-primary btn-sm">Search</button>
        </form>
        </div>
      </div>
    </nav>
  );
}
