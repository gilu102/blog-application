import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { articles } from "../api/endpoints";

export default function AllArticles() {
  const [searchParams] = useSearchParams();
  const searchFromUrl = searchParams.get("search") || "";
  const [list, setList] = useState([]);
  const [search, setSearch] = useState(searchFromUrl);
  const [applied, setApplied] = useState(searchFromUrl);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  useEffect(() => {
    setLoading(true);
    const params = { page, page_size: 10 };
    if (applied) params.search = applied;
    articles.list(params)
      .then(({ data }) => {
        const raw = data.results ?? data ?? [];
        setList(Array.isArray(raw) ? raw : []);
        setHasNext(!!data.next);
        setHasPrev(!!data.previous);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [page, applied]);

  useEffect(() => {
    setSearch(searchFromUrl);
    setApplied(searchFromUrl);
  }, [searchFromUrl]);

  const handleSearch = (e) => {
    e.preventDefault();
    setApplied(search);
    setPage(1);
  };

  return (
    <div className="container">
      <h1>All Articles</h1>
      <form className="search-form" onSubmit={handleSearch}>
        <input type="text" placeholder="Search by title, content, tags, author..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <button type="submit" className="btn-primary">Search</button>
      </form>
      {loading && <p>Loading...</p>}
      {error && <p className="error">Error: {error}</p>}
      {!loading && !error && (
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
      )}
      {!loading && !error && list.length === 0 && <p>No articles found.</p>}
      {!loading && !error && (hasNext || hasPrev) && (
        <nav style={{ marginTop: "1rem" }}>
          <button type="button" className="btn-secondary" disabled={!hasPrev} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</button>
          <span style={{ margin: "0 1rem" }}>Page {page}</span>
          <button type="button" className="btn-secondary" disabled={!hasNext} onClick={() => setPage((p) => p + 1)}>Next</button>
        </nav>
      )}
    </div>
  );
}
