import { useContext, useEffect, useState } from 'react';
import BlogCard from '../components/BlogCard';
import api from '../lib/api';
import { AuthContext } from '../context/AuthContext';

export default function BlogPage() {
  const { user, token } = useContext(AuthContext);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ title: '', content: '' });

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/blogs');
      setBlogs(response.data);
    } catch (fetchError) {
      setMessage(fetchError.response?.data?.message || 'Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await api.post('/api/blogs', form);
      setForm({ title: '', content: '' });
      setMessage('Blog posted successfully.');
      await loadBlogs();
    } catch (submitError) {
      setMessage(submitError.response?.data?.message || 'Failed to post blog');
    }
  };

  return (
    <section className="page-shell animate-fade-in">
      <div className="page-header">
        <div>
          <span className="eyebrow">Blog</span>
          <h1>Community stories</h1>
          <p>Browse posts, write a new one, and interact with the community feed.</p>
        </div>
      </div>

      {message && <div className="notice-card">{message}</div>}

      {token && (
        <div className="card">
          <div className="card-body">
            <h2>Write a blog</h2>
            <form className="stack" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  className="form-control"
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Content</label>
                <textarea
                  className="form-control"
                  rows="6"
                  value={form.content}
                  onChange={(event) => setForm({ ...form, content: event.target.value })}
                />
              </div>
              <button type="submit" className="btn btn-secondary">Publish as {user?.username}</button>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="notice-card">Loading blogs...</div>
      ) : (
        <div className="grid">
          {blogs.map((blog) => <BlogCard key={blog._id} blog={blog} />)}
        </div>
      )}
    </section>
  );
}