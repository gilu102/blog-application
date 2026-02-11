import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "", first_name: "", last_name: "" });
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      const data = err.response?.data;
      const msg = (data && (data.username?.[0] || data.email?.[0] || data.password?.[0])) || data?.detail || "Registration failed.";
      setError(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  return (
    <div className="container">
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}
        <label>Username <input type="text" name="username" value={form.username} onChange={handleChange} required autoComplete="username" /></label>
        <label>Email <input type="email" name="email" value={form.email} onChange={handleChange} required autoComplete="email" /></label>
        <label>Password (min 8) <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={8} autoComplete="new-password" /></label>
        <label>First name <input type="text" name="first_name" value={form.first_name} onChange={handleChange} /></label>
        <label>Last name <input type="text" name="last_name" value={form.last_name} onChange={handleChange} /></label>
        <button type="submit" className="btn-primary">Register</button>
      </form>
      <p><Link to="/login">Login</Link></p>
    </div>
  );
}
