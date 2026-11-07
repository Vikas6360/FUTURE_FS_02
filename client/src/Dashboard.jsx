import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiFetch, isAuthenticated, removeAuthHeader } from './api'

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, newCount: 0, contactedCount: 0, convertedCount: 0 })
  const [leads, setLeads] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login')
      return
    }
    fetchStats()
    fetchLeads()
  }, [search, statusFilter])

  const fetchStats = async () => {
    try {
      const data = await apiFetch('/stats')
      setStats(data)
    } catch (err) {
      setError(err.message)
    }
  }

  const fetchLeads = async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (statusFilter) params.append('status', statusFilter)
      const data = await apiFetch(`/leads?${params.toString()}`)
      setLeads(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    try {
      await apiFetch(`/leads/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      })
      setLeads((prev) =>
        prev.map((lead) => (lead.id === id ? { ...lead, status: newStatus } : lead))
      )
      fetchStats()
    } catch (err) {
      alert(err.message || 'Failed to update status')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return
    try {
      await apiFetch(`/leads/${id}`, { method: 'DELETE' })
      setLeads((prev) => prev.filter((lead) => lead.id !== id))
      fetchStats()
    } catch (err) {
      alert(err.message || 'Failed to delete lead')
    }
  }

  const handleLogout = () => {
    removeAuthHeader()
    navigate('/login')
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="page-container page-container-lg">
      <header className="page-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="card-subtitle">Manage incoming leads and customer interactions</p>
        </div>
        <div className="header-actions">
          <Link to="/" className="btn btn-secondary">Website Form</Link>
          <button onClick={handleLogout} className="btn btn-outline">Logout</button>
        </div>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Leads</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="stat-card stat-card-new">
          <span className="stat-label">New</span>
          <span className="stat-value">{stats.newCount}</span>
        </div>
        <div className="stat-card stat-card-contacted">
          <span className="stat-label">Contacted</span>
          <span className="stat-value">{stats.contactedCount}</span>
        </div>
        <div className="stat-card stat-card-converted">
          <span className="stat-label">Converted</span>
          <span className="stat-value">{stats.convertedCount}</span>
        </div>
      </div>

      <div className="card">
        <div className="filters-bar">
          <input
            type="text"
            className="filter-search"
            placeholder="Search leads by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="NEW">NEW</option>
            <option value="CONTACTED">CONTACTED</option>
            <option value="CONVERTED">CONVERTED</option>
          </select>
        </div>

        {loading ? (
          <p className="empty-state">Loading leads...</p>
        ) : leads.length === 0 ? (
          <p className="empty-state">No leads found matching your criteria.</p>
        ) : (
          <div className="table-responsive">
            <table className="leads-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id}>
                    <td className="lead-name">{lead.name}</td>
                    <td>{lead.email}</td>
                    <td><span className="source-tag">{lead.source}</span></td>
                    <td>
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        className={`status-select status-${lead.status.toLowerCase()}`}
                      >
                        <option value="NEW">NEW</option>
                        <option value="CONTACTED">CONTACTED</option>
                        <option value="CONVERTED">CONVERTED</option>
                      </select>
                    </td>
                    <td className="date-cell">{formatDate(lead.createdAt)}</td>
                    <td className="actions-cell">
                      <Link to={`/admin/lead/${lead.id}`} className="btn-link">View</Link>
                      <button onClick={() => handleDelete(lead.id)} className="btn-danger-sm">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
