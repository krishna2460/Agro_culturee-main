import { useContext, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthContext } from './context/AuthContext'
import HomePage from './pages/HomePage'
import MarketPage from './pages/MarketPage'
import ProductDetailPage from './pages/ProductDetailPage'
import BlogPage from './pages/BlogPage'
import BlogDetailPage from './pages/BlogDetailPage'
import ProfilePage from './pages/ProfilePage'
import CartPage from './pages/CartPage'
import UploadProductPage from './pages/UploadProductPage'
import OrdersPage from './pages/OrdersPage'
import './App.css'

function AuthModal({ mode, onClose }) {
  const { login, register } = useContext(AuthContext)
  const isLogin = mode === 'login'
  const [form, setForm] = useState({
    role: 'buyer',
    username: '',
    email: '',
    password: '',
    mobile: '',
    name: '',
    address: '',
  })
  const [error, setError] = useState('')

  const submit = async (event) => {
    event.preventDefault()

    const response = isLogin
      ? await login(form.username, form.password, form.role)
      : await register(form)

    if (response.success) {
      onClose()
      return
    }

    setError(response.message)
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div className="modal-card" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="eyebrow">{isLogin ? 'Login' : 'Register'}</span>
            <h2>{isLogin ? 'Welcome back' : 'Create an account'}</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose}>×</button>
        </div>

        <form className="stack" onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-control" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
              <option value="buyer">Buyer</option>
              <option value="farmer">Farmer</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Username</label>
            <input className="form-control" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} />
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-control" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Mobile</label>
                <input className="form-control" value={form.mobile} onChange={(event) => setForm({ ...form, mobile: event.target.value })} />
              </div>
              <div className="field-grid">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input className="form-control" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input className="form-control" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-control" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          </div>

          {error && <div className="notice-card error">{error}</div>}

          <button type="submit" className="btn btn-primary">{isLogin ? 'Login' : 'Register'}</button>
        </form>
      </div>
    </div>
  )
}

function App() {
  const [authMode, setAuthMode] = useState(null)

  return (
    <div className="app-shell">
      <Navbar
        onOpenLogin={() => setAuthMode('login')}
        onOpenRegister={() => setAuthMode('register')}
      />

      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/market" element={<MarketPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:id" element={<BlogDetailPage />} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute allowedRoles={['buyer']}><CartPage /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute allowedRoles={['buyer']}><OrdersPage /></ProtectedRoute>} />
          <Route path="/upload-product" element={<ProtectedRoute allowedRoles={['farmer']}><UploadProductPage /></ProtectedRoute>} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>

      <Footer />

      {authMode && <AuthModal key={authMode} mode={authMode} onClose={() => setAuthMode(null)} />}
    </div>
  )
}

export default App
