import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BASE_URL, setAuthHeader } from './api'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const auth = 'Basic ' + btoa(`${username}:${password}`)

    try {
      const res = await fetch(`${BASE_URL}/stats`, {
        headers: { Authorization: auth }
      })

      if (res.ok) {
        setAuthHeader(auth)
        navigate('/admin')
      } else {
        setError('Invalid username or password')
      }
    } catch (err) {
      setError('Unable to reach server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container page-container-sm">
      <header className="page-header">
        <h1>Admin Login</h1>
        <Link to="/" className="nav-link">Back to Website</Link>
      </header>

      <div className="card">
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleLogin} className="form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  )
}
