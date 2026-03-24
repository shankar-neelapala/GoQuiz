import React, { useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import ExamSchedule from './ExamSchedule';
import ConductExam from './ConductExam';
import ViewQuestions from './ViewQuestions';
import ViewResults from './ViewResults';
import ViewLabResults from './ViewLabResults';
import UpdateExamSchedule from './UpdateExamSchedule';
import GroqChatDirect from './GrokChatDirect';

function Employee() {
  const location = useLocation();
  const navigate = useNavigate();
  const details = location.state?.details || null;
  const token = location.state?.token || null;
  const [page, setPage] = useState(<ExamSchedule details={details} token={token} />);
  const dashboardRef = useRef(null);
  const conductexamRef = useRef(null);
  const updatescheduleRef = useRef(null);
  const viewqueRef = useRef(null);
  const viewresultRef = useRef(null);
  const viewlabresultRef = useRef(null);
  const logoutRef = useRef(null);
  const [ai, setAi] = useState();
  const tdiv = useRef(null);

  if (!details) {
    return (
      <div className="svec-error-state">
        <div className="svec-error-box">ERROR: YOU ARE NOT AN AUTHORIZED PERSON.</div>
      </div>
    );
  }

  const setActive = (ref) => {
    [dashboardRef, conductexamRef, updatescheduleRef, viewqueRef, viewresultRef, viewlabresultRef, logoutRef].forEach(r => {
      if (r.current) r.current.classList.remove('active');
    });
    if (ref.current) ref.current.classList.add('active');
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="svec-topbar">
        <div className="svec-topbar-brand">WELCOME {details[0]?.name || "Employee"}</div>
        <button className="svec-topbar-chatbtn" onClick={() => { setAi(<GroqChatDirect />); tdiv.current.style.display = "flex"; }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
            <path d="M2.678 11.894a1 1 0 0 1 .287.801 11 11 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8 8 0 0 0 8 14c3.996 0 7-2.807 7-6s-3.004-6-7-6-7 2.808-7 6c0 1.468.617 2.83 1.678 3.894m-.493 3.905a22 22 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a10 10 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105"/>
            <path d="M4 5.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8m0 2.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5"/>
          </svg>
          CHATBOARD
        </button>
      </div>

      <div className="svec-layout">
        <div className="svec-sidebar">
          <button className="svec-nav-btn active" ref={dashboardRef}
            onClick={() => { setActive(dashboardRef); setPage(<ExamSchedule details={details} branch={details[0].branch} token={token} />); }}>
            Dashboard
          </button>
          <button className="svec-nav-btn" ref={conductexamRef}
            onClick={() => { setActive(conductexamRef); setPage(<ConductExam username={details[0].username} token={token} />); }}>
            Conduct Exam
          </button>
          {details[0].role === "HOD" && (
            <button className="svec-nav-btn" ref={updatescheduleRef}
              onClick={() => { setActive(updatescheduleRef); setPage(<UpdateExamSchedule username={details[0].username} token={token} />); }}>
              Update Exam Schedule
            </button>
          )}
          <button className="svec-nav-btn" ref={viewqueRef}
            onClick={() => { setActive(viewqueRef); setPage(<ViewQuestions username={details[0].username} token={token} />); }}>
            View Question Paper
          </button>
          <button className="svec-nav-btn" ref={viewresultRef}
            onClick={() => { setActive(viewresultRef); setPage(<ViewResults username={details[0].username} token={token} />); }}>
            View Quiz Results
          </button>
          <button className="svec-nav-btn" ref={viewlabresultRef}
            onClick={() => { setActive(viewlabresultRef); setPage(<ViewLabResults username={details[0].username} token={token} />); }}>
            View Lab Results
          </button>
          <button className="svec-nav-btn" ref={logoutRef}
            onClick={() => { setActive(logoutRef); navigate("/"); }}>
            Logout
          </button>
        </div>

        <div className="svec-content">
          {page}
        </div>

        <div ref={tdiv} style={{ display: 'none', position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000, width: '340px', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 16px 48px rgba(15,45,94,0.3)', background: 'rgba(255,255,255,0.98)', border: '1px solid var(--border)', animation: 'slideUp 0.3s ease' }}>
          <button onClick={() => { setAi(""); tdiv.current.style.display = "none"; }}
            style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: '50%', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--danger)', zIndex: 1 }}>
            ✕
          </button>
          <div style={{ position: 'relative', height: '315px', overflow: 'scroll' }}>{ai}</div>
        </div>
      </div>
    </div>
  );
}

export default Employee
