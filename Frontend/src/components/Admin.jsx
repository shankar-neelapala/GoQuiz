import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useRef } from 'react'
import CreateStudent from './CreateStudent'
import CreateFaculty from './CreateFaculty'
import ViewStudents from './ViewStudents'
import ViewFaculties from './ViewFaculties'
import axios from 'axios'

// ── Create Schedule Sub-component ──────────────────────────────────────────
function CreateSchedule({ token }) {
  const [form, setForm] = useState({
    examtype: '',
    branch: '',
    semester: '',
    coursecode: '',
    subject: '',
    date: '',
    startTime: '',
    endTime: '',
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    // Validate all fields
    for (const [key, val] of Object.entries(form)) {
      if (!val || val.trim() === '') {
        setErrorMsg(`Please fill in: ${key}`);
        setLoading(false);
        return;
      }
    }

    axios.post(
      `http://${import.meta.env.VITE_HOST}:8080/super-admin/addschedule`,
      form,
      { headers: { Authorization: token }, withCredentials: true }
    )
      .then(() => {
        setSuccessMsg('Schedule created successfully!');
        setForm({ examtype: '', branch: '', semester: '', coursecode: '', subject: '', date: '', startTime: '', endTime: '' });
        setLoading(false);
      })
      .catch(err => {
        setErrorMsg(err?.response?.data?.message || err.message || 'Failed to create schedule.');
        setLoading(false);
      });
  };

  const EXAM_TYPES = ['MID-1', 'MID-2', 'EXTERNAL', 'LAB-MID-1', 'LAB-MID-2', 'LAB-EXTERNAL'];
  const BRANCHES = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AIDS', 'CSD'];
  const SEMESTERS = ['1', '2', '3', '4', '5', '6', '7', '8'];

  return (
    <div style={{ padding: '24px 28px', width: '100%', boxSizing: 'border-box' }}>
      <div className="svec-form-panel" style={{ maxWidth: '600px' }}>
        <div className="svec-form-panel-title">Create Exam Schedule</div>

        {successMsg && (
          <div style={{
            background: 'rgba(16,185,129,0.1)', color: 'var(--success)',
            border: '1px solid rgba(16,185,129,0.3)', borderRadius: 'var(--radius-md)',
            padding: '10px 16px', marginBottom: '16px', fontWeight: 600, fontSize: '0.88rem'
          }}>
            ✓ {successMsg}
          </div>
        )}

        {errorMsg && (
          <div style={{
            background: 'rgba(239,68,68,0.08)', color: 'var(--danger)',
            border: '1px solid rgba(239,68,68,0.25)', borderRadius: 'var(--radius-md)',
            padding: '10px 16px', marginBottom: '16px', fontWeight: 600, fontSize: '0.88rem'
          }}>
            ✗ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>

            {/* Exam Type */}
            <div className="svec-form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="svec-label">Exam Type</label>
              <select
                name="examtype"
                value={form.examtype}
                onChange={handleChange}
                className="svec-select"
                required
              >
                <option value="">-- Select Exam Type --</option>
                {EXAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Branch */}
            <div className="svec-form-group">
              <label className="svec-label">Branch</label>
              <select
                name="branch"
                value={form.branch}
                onChange={handleChange}
                className="svec-select"
                required
              >
                <option value="">-- Select Branch --</option>
                {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            {/* Semester */}
            <div className="svec-form-group">
              <label className="svec-label">Semester</label>
              <select
                name="semester"
                value={form.semester}
                onChange={handleChange}
                className="svec-select"
                required
              >
                <option value="">-- Select Semester --</option>
                {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>

            {/* Course Code */}
            <div className="svec-form-group">
              <label className="svec-label">Course Code</label>
              <input
                type="text"
                name="coursecode"
                value={form.coursecode}
                onChange={handleChange}
                className="svec-input"
                placeholder="e.g. CS301"
                required
              />
            </div>

            {/* Subject */}
            <div className="svec-form-group">
              <label className="svec-label">Subject</label>
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                className="svec-input"
                placeholder="e.g. Data Structures"
                required
              />
            </div>

            {/* Date */}
            <div className="svec-form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="svec-label">Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="svec-input"
                required
              />
            </div>

            {/* Start Time */}
            <div className="svec-form-group">
              <label className="svec-label">Start Time</label>
              <input
                type="time"
                name="startTime"
                value={form.startTime}
                onChange={handleChange}
                className="svec-input"
                required
              />
            </div>

            {/* End Time */}
            <div className="svec-form-group">
              <label className="svec-label">End Time</label>
              <input
                type="time"
                name="endTime"
                value={form.endTime}
                onChange={handleChange}
                className="svec-input"
                required
              />
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <button
              type="submit"
              className="svec-btn"
              disabled={loading}
              style={{
                background: loading ? 'rgba(99,102,241,0.4)' : 'var(--primary)',
                color: '#fff',
                border: 'none',
                padding: '10px 32px',
                borderRadius: 'var(--radius-md)',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}
            >
              {loading ? (
                <>
                  <span style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                  Creating...
                </>
              ) : 'Create Schedule'}
            </button>
          </div>
        </form>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Admin Page ──────────────────────────────────────────────────────────────
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
  const scheduleRef = useRef(null)
  const logoutRef = useRef(null)

  const clearActive = () => {
    [studentRef, facultyRef, viewStudentRef, viewFacultyRef, scheduleRef, logoutRef].forEach(r => {
      if (r.current) r.current.classList.remove('active')
    })
  }

  const handleCreateStudent = () => { clearActive(); studentRef.current.classList.add('active'); setPage(<CreateStudent token={token} />) }
  const handleAdminHome = () => { clearActive(); setPage(adminHome) }
  const handleCreateFaculty = () => { clearActive(); facultyRef.current.classList.add('active'); setPage(<CreateFaculty token={token} />) }
  const handleViewStudents = () => { clearActive(); viewStudentRef.current.classList.add('active'); setPage(<ViewStudents token={token} />) }
  const handleViewFaculties = () => { clearActive(); viewFacultyRef.current.classList.add('active'); setPage(<ViewFaculties token={token} />) }
  const handleCreateSchedule = () => { clearActive(); scheduleRef.current.classList.add('active'); setPage(<CreateSchedule token={token} />) }
  const handleLogout = () => {
    try { localStorage.clear() } catch (e) {}
    navigate('/')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div className="svec-topbar">
        <div className="svec-topbar-brand" style={{ cursor: 'pointer' }} onClick={handleAdminHome}>
          Admin Panel
        </div>
      </div>

      <div className="svec-layout">
        <div className="svec-sidebar">
          <button ref={studentRef} className="svec-nav-btn" onClick={handleCreateStudent}>Create Student</button>
          <button ref={facultyRef} className="svec-nav-btn" onClick={handleCreateFaculty}>Create Faculty</button>
          <button ref={viewStudentRef} className="svec-nav-btn" onClick={handleViewStudents}>View Students</button>
          <button ref={viewFacultyRef} className="svec-nav-btn" onClick={handleViewFaculties}>View Faculties</button>
          <button ref={scheduleRef} className="svec-nav-btn" onClick={handleCreateSchedule}>Create Schedule</button>
          <button ref={logoutRef} className="svec-nav-btn" onClick={handleLogout}
            style={{ marginTop: 'auto', color: 'rgba(239,68,68,0.8)'}}>
            <h6><b>Logout</b></h6>
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
