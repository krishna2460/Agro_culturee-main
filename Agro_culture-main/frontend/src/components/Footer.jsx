export default function Footer() {
  return (
    <footer style={{
      backgroundColor: '#1b1b1b',
      color: '#ffffff',
      padding: '60px 40px 40px',
      marginTop: '80px',
      fontSize: '0.95rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '40px',
        marginBottom: '40px'
      }}>
        <div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '20px', color: 'var(--primary-light)' }}>
            🌱 AgroCulture
          </h3>
          <p style={{ color: '#b0bec5', marginBottom: '16px' }}>
            Your product, Our market. Delivering a premium digital marketplace platform for farmers and buyers.
          </p>
          <p style={{ color: '#cfd8dc' }}>&copy; {new Date().getFullYear()} AgroCulture. All rights reserved.</p>
        </div>

        <div>
          <h4 style={{ fontSize: '1.2rem', marginBottom: '20px', color: '#ffffff' }}>Contact Info</h4>
          <ul style={{ listStyle: 'none', color: '#b0bec5', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li>📍 123 Green Valley Farm, Vormir Countryside</li>
            <li>📞 +1 234 567 8900</li>
            <li>✉️ agroculture@gmail.com</li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: '1.2rem', marginBottom: '20px', color: '#ffffff' }}>About The Platform</h4>
          <p style={{ color: '#b0bec5' }}>
            AgroCulture is a next-generation decentralized e-commerce trading portal bridging the gap between local farming products and urban buyers. Browse crops, post articles, write reviews, and trade directly with trust.
          </p>
        </div>
      </div>

      <div style={{
        borderTop: '1px solid #37474f',
        paddingTop: '20px',
        textAlign: 'center',
        color: '#78909c',
        fontSize: '0.85rem'
      }}>
        Made with ❤️ for modern agricultural sustainability.
      </div>
    </footer>
  );
}
