import { Link } from 'react-router-dom';

export default function BlogCard({ blog }) {
  const publishDate = blog.createdAt
    ? new Date(blog.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Recently';

  // Strip HTML tags for preview snippet
  const getSnippet = (htmlContent) => {
    if (!htmlContent) return '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    return text.substring(0, 150) + (text.length > 150 ? '...' : '');
  };

  return (
    <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
          <span>✍️ {blog.authorUsername}</span>
          <span>📅 {publishDate}</span>
        </div>

        <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-color)' }}>
          {blog.title}
        </h3>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '24px', flex: 1 }}>
          {getSnippet(blog.content)}
        </p>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', gap: '16px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <span>❤️ {blog.likes?.length || 0} Likes</span>
            <span>💬 {blog.comments?.length || 0} Comments</span>
          </div>

          <Link to={`/blog/${blog._id}`} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
            Read More
          </Link>
        </div>
      </div>
    </div>
  );
}
