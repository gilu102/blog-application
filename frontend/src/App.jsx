import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import AllArticles from "./pages/AllArticles";
import ArticleDetail from "./pages/ArticleDetail";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import Register from "./pages/Register";

export default function App() {
  return (
    <AuthProvider>
      <NavBar />
      <main style={{ padding: "1rem 0" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/articles" element={<AllArticles />} />
          <Route path="/articles/:id" element={<ArticleDetail />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
    </AuthProvider>
  );
}
