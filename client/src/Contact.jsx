import { useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from './api'

export default function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [statusMsg, setStatusMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setStatusMsg('')
    setLoading(true)

    try {
      await apiFetch('/leads', {
        method: 'POST',
        body: JSON.stringify({ name, email, message })
      })
      setStatusMsg('Thank you! Your message has been received.')
      setName('')
      setEmail('')
      setMessage('')
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit form')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Contact Us</h1>
        <Link to="/login" className="nav-link">Admin Login</Link>
      </header>

      <div className="card">
        <p className="card-subtitle">Leave your details and message. Our team will get in touch shortly.</p>

        {statusMsg && <div className="alert alert-success">{statusMsg}</div>}
        {errorMsg && <div className="alert alert-error">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              required
              rows="4"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="How can we help you?"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  )
}
