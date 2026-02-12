import { createContext, useContext, useState, useEffect } from "react";
import { auth as authApi, me as meApi } from "../api/endpoints";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const { data } = await meApi();
      setUser({ id: data.id, username: data.username, groups: data.groups || [], is_staff: data.is_staff });
    } catch (_e) {
      setUser(null);
    }
  };

  const login = async (username, password) => {
    const { data } = await authApi.login(username, password);
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);
    await fetchUser();
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
    if (access) fetchUser().finally(() => setLoading(false));
    else setLoading(false);
  }, []);

  const isAdmin = user?.groups?.includes("Admin") || user?.is_staff;
  const isCreator = user?.groups?.includes("Editors") || isAdmin;
  const canEditArticle = (article) => isAdmin || (isCreator && article?.author_username === user?.username);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, isAdmin, isCreator, canEditArticle }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
