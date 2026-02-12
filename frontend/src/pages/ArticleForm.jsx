import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { articles as articlesApi, tags as tagsApi } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";

export default function ArticleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isCreator, canEditArticle } = useAuth();
  const isEdit = Boolean(id);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author_name, setAuthorName] = useState("");
  const [tagIds, setTagIds] = useState([]);
  const [tagList, setTagList] = useState([]);
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    tagsApi.list().then(({ data }) => setTagList(Array.isArray(data) ? data : data?.results ?? [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) {
      setAuthorName(user?.username ?? "");
      setLoading(false);
      return;
    }
    articlesApi.get(id).then(({ data }) => {
      setArticle(data);
      setTitle(data.title);
      setContent(data.content);
      setAuthorName(data.author_name ?? "");
      setTagIds((data.tags ?? []).map((t) => t.id));
    }).catch((e) => setError(e.response?.data?.detail || e.message)).finally(() => setLoading(false));
  }, [id, isEdit, user?.username]);

  const toggleTag = (tagId) => {
    setTagIds((prev) => (prev.includes(tagId) ? prev.filter((x) => x !== tagId) : [...prev, tagId]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEdit && !isCreator) return;
    setError(null);
    setSubmitting(true);
    const payload = { title, content, author_name, tag_ids: tagIds };
    try {
      if (isEdit) {
        await articlesApi.update(id, payload);
        navigate(`/articles/${id}`);
      } else {
        const { data } = await articlesApi.create(payload);
        navigate(`/articles/${data.id}`);
      }
    } catch (err) {
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data) || "Failed to save.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="container">Loading...</div>;
  if (!user) return <div className="container">Please log in.</div>;
  if (!isEdit && !isCreator) return <div className="container">You do not have permission to create articles.</div>;
  if (isEdit && !article) return <div className="container">{error || "Article not found."}</div>;
  if (isEdit && article && !canEditArticle(article)) {
    return <div className="container">You do not have permission to edit this article.</div>;
  }

  return (
    <div className="container">
      <h1>{isEdit ? "Edit article" : "New article"}</h1>
      <form onSubmit={handleSubmit} className="article-form">
        {error && <p className="error">{error}</p>}
        <label>
          Title
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} />
        </label>
        <label>
          Author name
          <input type="text" value={author_name} onChange={(e) => setAuthorName(e.target.value)} required maxLength={100} />
        </label>
        <label>
          Content
          <textarea value={content} onChange={(e) => setContent(e.target.value)} required rows={10} />
        </label>
        {tagList.length > 0 && (
          <fieldset>
            <legend>Tags</legend>
            {tagList.map((t) => (
              <label key={t.id} className="checkbox-label">
                <input type="checkbox" checked={tagIds.includes(t.id)} onChange={() => toggleTag(t.id)} />
                {t.name}
              </label>
            ))}
          </fieldset>
        )}
        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? "Saving..." : "Save"}</button>
          <button type="button" className="btn-secondary" onClick={() => navigate(isEdit ? `/articles/${id}` : "/articles")}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
