import { useCallback, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../lib/api';
import { AuthContext } from '../context/AuthContext';

export default function BlogDetailPage() {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const [blog, setBlog] = useState(null);
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');

  const loadBlog = useCallback(async () => {
    const response = await api.get(`/api/blogs/${id}`);
    setBlog(response.data);
  }, [id]);

  useEffect(() => {
    loadBlog().catch((error) => setMessage(error.response?.data?.message || 'Failed to load blog'));
  }, [loadBlog]);

  const toggleLike = async () => {
    try {
      await api.post(`/api/blogs/${id}/like`);
      await loadBlog();
    } catch (likeError) {
      setMessage(likeError.response?.data?.message || 'Failed to update like');
    }
  };

  const submitComment = async (event) => {
    event.preventDefault();

    try {
      await api.post(`/api/blogs/${id}/comments`, { comment });
      setComment('');
      await loadBlog();
    } catch (commentError) {
      setMessage(commentError.response?.data?.message || 'Failed to submit comment');
    }
  };

  if (!blog) {
    return <section className="page-shell"><div className="notice-card">{message || 'Loading blog...'}</div></section>;
  }

  return (
    <section className="page-shell animate-fade-in">
      <div className="card">
        <div className="card-body stack">
          <span className="eyebrow">By {blog.authorUsername}</span>
          <h1>{blog.title}</h1>
          <p className="detail-text">{blog.content}</p>
          <div className="hero-actions">
            <button type="button" className="btn btn-primary" onClick={toggleLike} disabled={!token}>
              Like ({blog.likes?.length || 0})
            </button>
          </div>
          {message && <div className="notice-card">{message}</div>}
        </div>
      </div>

      <div className="content-grid">
        <div className="card content-panel">
          <div className="card-body stack">
            <h2>Comments</h2>
            {blog.comments?.length ? blog.comments.map((item) => (
              <article key={`${item._id || item.createdAt}-${item.username}`} className="mini-card">
                <strong>{item.username}</strong>
                <p>{item.comment}</p>
              </article>
            )) : <div className="notice-card">No comments yet.</div>}
          </div>
        </div>

        <div className="card content-panel">
          <div className="card-body stack">
            <h2>Add comment</h2>
            <form className="stack" onSubmit={submitComment}>
              <textarea className="form-control" rows="5" value={comment} onChange={(event) => setComment(event.target.value)} />
              <button type="submit" className="btn btn-secondary" disabled={!token}>Post Comment</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}