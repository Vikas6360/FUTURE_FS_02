import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { apiFetch, isAuthenticated } from './api'

export default function LeadDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [lead, setLead] = useState(null)
  const [notes, setNotes] = useState([])
  const [noteText, setNoteText] = useState('')
  const [followUpDate, setFollowUpDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submittingNote, setSubmittingNote] = useState(false)

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login')
      return
    }
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      const [leadData, notesData] = await Promise.all([
        apiFetch(`/leads/${id}`),
        apiFetch(`/leads/${id}/notes`)
      ])
      setLead(leadData)
      setNotes(notesData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus) => {
    try {
      const updated = await apiFetch(`/leads/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      })
      setLead(updated)
    } catch (err) {
      alert(err.message || 'Failed to update status')
    }
  }

  const handleAddNote = async (e) => {
    e.preventDefault()
    if (!noteText.trim()) return

    setSubmittingNote(true)
    try {
      const payload = {
        text: noteText.trim(),
        followUpDate: followUpDate || null
      }
      const newNote = await apiFetch(`/leads/${id}/notes`, {
        method: 'POST',
        body: JSON.stringify(payload)
      })
      setNotes((prev) => [newNote, ...prev])
      setNoteText('')
      setFollowUpDate('')
    } catch (err) {
      alert(err.message || 'Failed to add note')
    } finally {
      setSubmittingNote(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div className="page-container page-container-md">
        <p className="empty-state">Loading lead details...</p>
      </div>
    )
  }

  if (error || !lead) {
    return (
      <div className="page-container page-container-md">
        <div className="alert alert-error">{error || 'Lead not found'}</div>
        <Link to="/admin" className="btn btn-secondary">← Back to Dashboard</Link>
      </div>
    )
  }

  return (
    <div className="page-container page-container-md">
      <header className="page-header">
        <div>
          <Link to="/admin" className="nav-link">← Back to Dashboard</Link>
          <h1 style={{ marginTop: '0.5rem' }}>Lead Details</h1>
        </div>
        <div>
          <select
            value={lead.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className={`status-select status-${lead.status.toLowerCase()}`}
          >
            <option value="NEW">NEW</option>
            <option value="CONTACTED">CONTACTED</option>
            <option value="CONVERTED">CONVERTED</option>
          </select>
        </div>
      </header>

      <div className="card">
        <div className="lead-header-row">
          <div>
            <h2 className="lead-title">{lead.name}</h2>
            <p className="lead-email">{lead.email}</p>
          </div>
          <div className="lead-meta">
            <span className="source-tag">{lead.source}</span>
            <span className="date-cell">{formatDate(lead.createdAt)}</span>
          </div>
        </div>

        <div className="message-box">
          <label className="field-label">Original Message</label>
          <p className="message-content">{lead.message}</p>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h2>Notes & Follow-ups</h2>

        <form onSubmit={handleAddNote} className="form" style={{ marginTop: '1rem', marginBottom: '2rem' }}>
          <div className="form-group">
            <label htmlFor="noteText">Add a Note</label>
            <textarea
              id="noteText"
              rows="3"
              required
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Record call summary, meeting points, next steps..."
            />
          </div>

          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="followUpDate">Follow-up Date (Optional)</label>
              <input
                id="followUpDate"
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={submittingNote}>
                {submittingNote ? 'Saving...' : 'Add Note'}
              </button>
            </div>
          </div>
        </form>

        <div className="notes-list">
          {notes.length === 0 ? (
            <p className="empty-state">No notes recorded yet.</p>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="note-card">
                <div className="note-body">{note.text}</div>
                <div className="note-footer">
                  <span className="date-cell">{formatDate(note.createdAt)}</span>
                  {note.followUpDate && (
                    <span className="followup-tag">
                      Follow-up: {note.followUpDate}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
