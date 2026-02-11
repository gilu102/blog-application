import { createContext, useContext, useState, useEffect } from "react";
import { auth as authApi } from "../api/endpoints";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (username, password) => {
    const { data } = await authApi.login(username, password);
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);
    setUser({ username });
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setUser(null);
  };

  const register = async (userData) => {
    await authApi.register(userData);
    await login(userData.username, userData.password);
  };

  useEffect(() => {
    const access = localStorage.getItem("access");
    if (access) {
      try {
        const payload = JSON.parse(atob(access.split(".")[1]));
        setUser({ username: payload.username || "" });
      } catch (_e) {}
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
