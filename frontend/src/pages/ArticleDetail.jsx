import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { articles as articlesApi, comments as commentsApi, ratings as ratingsApi } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";

export default function ArticleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, canEditArticle } = useAuth();
  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [rating, setRating] = useState({ average: 0, count: 0, user_rating: null });
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadArticle = () => {
    articlesApi.get(id).then(({ data }) => setArticle(data)).catch((e) => setError(e.message)).finally(() => setLoading(false));
  };

  const loadComments = () => {
    commentsApi.listByArticle(id).then(({ data }) => setComments(data.results ?? data ?? []));
  };

  const loadRating = () => {
    ratingsApi.get(id).then(({ data }) => setRating(data)).catch(() => {});
  };

  useEffect(() => {
    loadArticle();
    loadComments();
    loadRating();
  }, [id]);

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    commentsApi.create(id, newComment.trim()).then(() => { setNewComment(""); loadComments(); }).catch((e) => setError(e.response?.data?.detail || e.message));
  };

  const startEdit = (c) => { setEditingId(c.id); setEditContent(c.content); };

  const saveEdit = () => {
    if (editingId == null) return;
    commentsApi.update(editingId, editContent).then(() => { setEditingId(null); setEditContent(""); loadComments(); }).catch((e) => setError(e.response?.data?.detail || e.message));
  };

  const handleDelete = (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    commentsApi.delete(commentId).then(() => loadComments()).catch((e) => setError(e.response?.data?.detail || e.message));
  };

  const canModify = (c) => user && c.user_name === user.username;
  const canEdit = article && canEditArticle(article);

  const handleDeleteArticle = () => {
    if (!window.confirm("Delete this article?")) return;
    articlesApi.delete(id).then(() => navigate("/articles")).catch((e) => setError(e.response?.data?.detail || e.message));
  };

  const handleRate = (score) => {
    if (!user) return;
    ratingsApi.set(id, score).then(({ data }) => setRating(data)).catch((e) => setError(e.response?.data?.score?.[0] || e.message));
  };

  if (loading) return <div className="container">Loading...</div>;
  if (error && !article) return <div className="container">Error: {error}</div>;
  if (!article) return null;

  return (
    <div className="container">
      <article className="article-with-comments">
        <div className="article-header-row">
          <h1>{article.title}</h1>
          {canEdit && (
            <div className="article-actions">
              <Link to={`/articles/${id}/edit`} className="btn-primary btn-sm">Edit</Link>
              <button type="button" className="btn-secondary btn-sm" onClick={handleDeleteArticle}>Delete</button>
            </div>
          )}
        </div>
        <p className="meta">{article.author_name} · {new Date(article.publication_date).toLocaleDateString()}</p>
        {article.tags?.length > 0 && <p>{article.tags.map((t) => t.name).join(", ")}</p>}
        <div className="rating-stars">
          <span>Rating: </span>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={rating.user_rating !== null && star <= rating.user_rating ? "filled" : "empty"}
              onClick={() => handleRate(star)}
              title={`${star} star(s)`}
              disabled={!user}
            >
              ★
            </button>
          ))}
          <span> {rating.average} ({rating.count})</span>
        </div>
        <div>{article.content}</div>

        <section className="comments-inline">
          <h2>Comments</h2>
          {user && (
            <form onSubmit={handleAddComment}>
              <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write a comment..." rows={3} />
              <button type="submit" className="btn-primary">Add Comment</button>
            </form>
          )}
          {!user && <p>Log in to add a comment.</p>}
          <ul className="comment-list">
            {comments.map((c) => (
              <li key={c.id} className="comment-item">
                {editingId === c.id ? (
                  <>
                    <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={2} />
                    <div className="comment-actions">
                      <button type="button" className="btn-primary" onClick={saveEdit}>Save</button>
                      <button type="button" className="btn-secondary" onClick={() => { setEditingId(null); setEditContent(""); }}>Cancel</button>
                    </div>
                  </>
                ) : (
                  <>
                    <p>{c.content}</p>
                    <p className="meta">{c.user_name} · {new Date(c.comment_date).toLocaleString()}</p>
                    {canModify(c) && (
                      <div className="comment-actions">
                        <button type="button" onClick={() => startEdit(c)}>Edit</button>
                        <button type="button" onClick={() => handleDelete(c.id)}>Delete</button>
                      </div>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        </section>
      </article>
    </div>
  );
}
