import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const q = search.trim();
    navigate(q ? `/articles?search=${encodeURIComponent(q)}` : "/articles");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/">Blog</Link>
        <form className="navbar-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn-primary btn-sm">Search</button>
        </form>
        <div className="navbar-links">
          <Link to="/">Home</Link>
          <Link to="/articles">Articles</Link>
          <Link to="/chat">Chat</Link>
          {user ? (
            <button type="button" onClick={handleLogout}>Logout</button>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
