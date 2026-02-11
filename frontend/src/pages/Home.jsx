import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { articles } from "../api/endpoints";

export default function Home() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    articles.list({ page_size: 3 })
      .then(({ data }) => {
        const raw = data.results ?? data;
        setList(Array.isArray(raw) ? raw : []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container">Loading...</div>;
  if (error) return <div className="container">Error: {error}</div>;

  return (
    <div className="container">
      <h1>Latest Articles</h1>
      <p>3 most recent articles.</p>
      <Link to="/articles">View all articles & search</Link>
      <ul className="article-list">
        {list.map((a) => (
          <li key={a.id} className="article-card">
            <Link to={`/articles/${a.id}`}>
              <h2>{a.title}</h2>
              <p className="meta">{a.author_name} · {new Date(a.publication_date).toLocaleDateString()}</p>
              <p>{a.content?.slice(0, 150)}...</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
