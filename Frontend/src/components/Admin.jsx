import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useRef } from 'react'
import CreateStudent from './CreateStudent'
import CreateFaculty from './CreateFaculty'
import ViewStudents from './ViewStudents'
import ViewFaculties from './ViewFaculties'

function Admin() {
  const navigate = useNavigate()
  const location = useLocation()
  const token = location.state?.token || null;

  const adminHome = (
    <div style={{ padding: '32px' }}>
      <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', padding: '40px', maxWidth: '520px', boxShadow: 'var(--shadow-md)', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🛡️</div>
        <h2 style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.4rem', marginBottom: '8px', letterSpacing: '0.04em' }}>Admin Panel</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Select an action from the sidebar to get started.</p>
      </div>
    </div>
  )

  const [page, setPage] = useState(adminHome)
  const studentRef = useRef(null)
  const facultyRef = useRef(null)
  const viewStudentRef = useRef(null)
  const viewFacultyRef = useRef(null)
  const logoutRef = useRef(null)

  const clearActive = () => {
    [studentRef, facultyRef, viewStudentRef, viewFacultyRef, logoutRef].forEach(r => {
      if (r.current) r.current.classList.remove('active')
    })
  }

  const handleCreateStudent = () => { clearActive(); studentRef.current.classList.add('active'); setPage(<CreateStudent token={token} />) }
  const handleAdminHome = () => { clearActive(); setPage(adminHome) }
  const handleCreateFaculty = () => { clearActive(); facultyRef.current.classList.add('active'); setPage(<CreateFaculty token={token} />) }
  const handleViewStudents = () => { clearActive(); viewStudentRef.current.classList.add('active'); setPage(<ViewStudents token={token} />) }
  const handleViewFaculties = () => { clearActive(); viewFacultyRef.current.classList.add('active'); setPage(<ViewFaculties token={token} />) }
  const handleLogout = () => {
    try { localStorage.clear() } catch (e) {}
    navigate('/')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {}
      <div className="svec-topbar">
        <div className="svec-topbar-brand" style={{ cursor: 'pointer' }} onClick={handleAdminHome}>
          Admin Panel
        </div>
      </div>

      <div className="svec-layout">
        {}
        <div className="svec-sidebar">
          <button ref={studentRef} className="svec-nav-btn" onClick={handleCreateStudent}>Create Student</button>
          <button ref={facultyRef} className="svec-nav-btn" onClick={handleCreateFaculty}>Create Faculty</button>
          <button ref={viewStudentRef} className="svec-nav-btn" onClick={handleViewStudents}>View Students</button>
          <button ref={viewFacultyRef} className="svec-nav-btn" onClick={handleViewFaculties}>View Faculties</button>
          <button ref={logoutRef} className="svec-nav-btn" onClick={handleLogout}
            style={{ marginTop: 'auto', color: 'rgba(239,68,68,0.8)', borderLeftColor: 'transparent' }}>
            Logout
          </button>
        </div>

        <div className="svec-content" style={{ padding: 0, overflow: 'auto' }}>
          {page}
        </div>
      </div>
    </div>
  )
}

export default Admin
