import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Contact from './Contact.jsx'
import Login from './Login.jsx'
import Dashboard from './Dashboard.jsx'
import LeadDetail from './LeadDetail.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/lead/:id" element={<LeadDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
