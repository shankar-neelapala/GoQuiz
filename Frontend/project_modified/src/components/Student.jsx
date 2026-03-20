import React from 'react'
import { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import StudentDashBoard from './StudentDashBoard';
import StuProfile from './StuProfile';
import ExamSchedule from './ExamSchedule';

function Student() {
  const navigate = useNavigate();
  const location = useLocation();
  const details = location.state?.details || null;
  const token = location.state?.token || null;
  const [page, setPage] = useState(<StudentDashBoard details={details} token={token} />);
  const dashboardRef = useRef(null);
  const profileRef = useRef(null);
  const examsRef = useRef(null);
  const logoutRef = useRef(null);

  if (!details) {
    return (
      <div className="svec-error-state">
        <div className="svec-error-box">ERROR: YOU ARE NOT AN AUTHORIZED PERSON.</div>
      </div>
    );
  }

  const setActive = (ref) => {
    [dashboardRef, profileRef, examsRef, logoutRef].forEach(r => {
      if (r.current) r.current.classList.remove('active');
    });
    if (ref.current) ref.current.classList.add('active');
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="svec-topbar">
        <div className="svec-topbar-brand">WELCOME {details[0].name || "Student"}</div>
      </div>

      <div className="svec-layout">
        <div className="svec-sidebar">
          <button className="svec-nav-btn active" ref={dashboardRef}
            onClick={() => { setActive(dashboardRef); setPage(<StudentDashBoard details={details} token={token} />); }}>
            Dashboard
          </button>
          <button className="svec-nav-btn" ref={profileRef}
            onClick={() => { setActive(profileRef); setPage(<StuProfile details={details} token={token} />); }}>
            Profile
          </button>
          <button className="svec-nav-btn" ref={examsRef}
            onClick={() => { setActive(examsRef); setPage(<ExamSchedule details={details} branch={details[0].branch} token={token} />); }}>
            Exam Schedule
          </button>
          <button className="svec-nav-btn" ref={logoutRef}
            onClick={() => { setActive(logoutRef); navigate("/"); }}>
            Logout
          </button>
        </div>

        <div className="svec-content" style={{ padding: 0, overflow: 'auto' }}>
          {page}
        </div>
      </div>
    </div>
  );
}

export default Student
