import React, { useEffect } from 'react'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

function Login() {
  const navigate = useNavigate();
  const [empusername, setEmpUsername] = useState("");
  const [emppassword, setEmppassword] = useState("");
  const [stuusername, setStuUsername] = useState("");
  const [stupassword, setStupassword] = useState("");
  const [emperr, setEmperr] = useState();
  const [stuerr, setStuerr] = useState();
  const [toast, setToast] = useState(null);

  useEffect(() => { document.title = "GoQuiz"; }, []);

  const showToast = (msg, type = 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const emp_handle_login = (e) => {
    e.preventDefault();
    axios.post(`http://${import.meta.env.VITE_HOST}:8080/noauth/loginemp`, null, {
      params: { username: empusername, password: emppassword }
    })
    .then(res => {
      const data = res.data;
      if (!data || !Array.isArray(data.details) || data.details.length === 0) {
        setEmperr("Invalid Username And Password");
        showToast("Invalid username or password.", "error");
        return;
      }
      const user = data.details[0];
      if (user.role?.toLowerCase() === "admin") {
        navigate("/admin", { state: { details: data.details, token: data.token } });
      } else if (user.role?.toLowerCase() === "teacher" || user.role?.toLowerCase() === "hod") {
        navigate("/employee", { state: { details: data.details, token: data.token } });
      }
    })
    .catch(err => {
      console.error("Employee login error:", err);
      setEmperr("Login failed. Please try again.");
      showToast("Login failed. Please try again.", "error");
    });
  };

  const stu_handle_login = (e) => {
    e.preventDefault();
    axios.post(`http://${import.meta.env.VITE_HOST}:8080/noauth/loginstu`, null, {
      params: { username: stuusername, password: stupassword }
    })
    .then(res => {
      const data = res.data;
      if (!data || !Array.isArray(data.details) || data.details.length === 0) {
        setStuerr("Invalid Username And Password");
        showToast("Invalid username or password.", "error");
        return;
      }
      const user = data.details[0];
      if (user.role?.toLowerCase() === "student") {
        navigate("/student", { state: { details: data.details, token: data.token } });
      } else {
        setStuerr("Invalid Username And Password");
        showToast("Invalid username or password.", "error");
      }
    })
    .catch(err => {
      console.error("Student login error:", err);
      setStuerr("Login failed. Please try again.");
      showToast("Login failed. Please try again.", "error");
    });
  };

  return (
    <>
      {}
      {toast && (
        <div style={{
          position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999, display: 'flex', alignItems: 'center', gap: '10px',
          background: toast.type === 'error' ? '#1e0a0a' : '#0a1e12',
          border: `1px solid ${toast.type === 'error' ? '#ef4444' : '#10b981'}`,
          borderLeft: `4px solid ${toast.type === 'error' ? '#ef4444' : '#10b981'}`,
          color: toast.type === 'error' ? '#fca5a5' : '#6ee7b7',
          padding: '14px 20px', borderRadius: '10px',
          boxShadow: `0 8px 32px ${toast.type === 'error' ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.25)'}`,
          fontSize: '0.88rem', fontWeight: 600, fontFamily: 'var(--font)',
          maxWidth: '90vw', minWidth: '280px',
          animation: 'toastIn 0.3s cubic-bezier(0.4,0,0.2,1)',
        }}>
          <span style={{ fontSize: '1.1rem' }}>{toast.type === 'error' ? '⚠️' : '✅'}</span>
          {toast.msg}
        </div>
      )}

      <style>{`
        @keyframes toastIn { from { opacity:0; transform:translateX(-50%) translateY(-12px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
        @keyframes cardIn { from { opacity:0; transform:translateY(32px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        .login-input { width:100%; padding:9px 13px; border:1.5px solid #e2e8f0; border-radius:8px; font-family:var(--font); font-size:0.88rem; color:#0f172a; background:#f8fafc; outline:none; transition:all 0.2s; }
        .login-input::placeholder { color:#94a3b8; }
        .login-input:focus { border-color:#0096c7; background:#fff; box-shadow:none; }
        .login-card { background:#fff; border:1px solid #e2e8f0; border-radius:14px; padding:28px 26px; width:min(300px,88vw); box-shadow:0 2px 16px rgba(15,45,94,0.09); animation:cardIn 0.45s cubic-bezier(0.4,0,0.2,1) both; }
        .login-card:nth-child(2) { animation-delay:0.1s; }
        .login-btn-emp { width:100%; padding:10px; border:none; border-radius:8px; background:#0f2d5e; color:#fff; font-family:var(--font); font-size:0.85rem; font-weight:700; cursor:pointer; transition:all 0.2s; letter-spacing:0.04em; }
        .login-btn-emp:hover { background:#1a4a8a; }
        .login-btn-stu { width:100%; padding:10px; border:none; border-radius:8px; background:#0096c7; color:#fff; font-family:var(--font); font-size:0.85rem; font-weight:700; cursor:pointer; transition:all 0.2s; letter-spacing:0.04em; }
        .login-btn-stu:hover { background:#0ea5c9; }
        .login-divider { height:1px; background:rgba(255,255,255,0.1); margin:20px 0; }
        .login-label { display:block; font-size:0.66rem; font-weight:700; letter-spacing:0.09em; text-transform:uppercase; color:#64748b; margin-bottom:4px; }
        .login-field { margin-bottom:12px; }
        .login-card-title { font-size:0.95rem; font-weight:800; color:#0f172a; letter-spacing:0.04em; text-transform:uppercase; margin-bottom:4px; display:flex; align-items:center; gap:8px; }
        .login-card-subtitle { font-size:0.72rem; color:#64748b; margin-bottom:18px; }
        .login-err { font-size:0.78rem; color:#ef4444; font-weight:600; min-height:18px; margin-bottom:8px; display:flex; align-items:center; gap:5px; }
      `}</style>

      <div style={{
        minHeight: '100vh', width: '100%',
        background: '#f5f7fa',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', position: 'relative', overflow: 'hidden',
        padding: '24px 0',
        boxSizing: 'border-box',
      }}>

        {}
        <div style={{ position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(15,45,94,0.04) 0%, transparent 70%)', top: '-200px', right: '-100px', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,180,216,0.05) 0%, transparent 70%)', bottom: '-150px', left: '-100px', pointerEvents: 'none' }} />

        {}
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', marginBottom: 'clamp(16px, 2.5vw, 28px)', padding: '0 16px', maxWidth: '800px' }}>
          <div style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 800, color: '#0f2d5e', letterSpacing: '-0.01em', fontFamily: 'var(--font)' }}>GoQuiz</span>
          </div>
          <p style={{ fontSize: 'clamp(0.78rem, 1.6vw, 0.9rem)', color: '#64748b', fontWeight: 400, lineHeight: 1.6, letterSpacing: '0.01em', maxWidth: '560px', margin: '0 auto' }}>
            Enhancing Exam Integrity Through Kafka-Powered Real-Time Monitoring
          </p>
        </div>

        {}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 'clamp(14px, 3vw, 28px)', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start', width: '100%', maxWidth: '680px', margin: '0 auto' }}>

          {}
          <form onSubmit={emp_handle_login} style={{ flex: '0 0 min(300px, calc(50% - 14px))', minWidth: '260px' }}>
            <div className="login-card">
              <div className="login-card-title">
                <span style={{ fontSize: '1.3rem' }}>👔</span> Employee Login
              </div>
              <div className="login-card-subtitle">For faculty and staff access</div>
              {emperr && <div className="login-err"><span>⚠</span>{emperr}</div>}
              <div className="login-field">
                <label className="login-label">Username</label>
                <input className="login-input" type="text" value={empusername} onChange={e => setEmpUsername(e.target.value)} autoComplete="username" placeholder="Enter your username" required />
              </div>
              <div className="login-field" style={{ marginBottom: '18px' }}>
                <label className="login-label">Password</label>
                <input className="login-input" type="password" value={emppassword} onChange={e => setEmppassword(e.target.value)} autoComplete="current-password" placeholder="Enter your password" required />
              </div>
              <button type="submit" className="login-btn-emp">Sign In as Employee</button>
            </div>
          </form>

          {}
          <form onSubmit={stu_handle_login} style={{ flex: '0 0 min(300px, calc(50% - 14px))', minWidth: '260px' }}>
            <div className="login-card" style={{ animationDelay: '0.12s' }}>
              <div className="login-card-title">
                <span style={{ fontSize: '1.3rem' }}>🎓</span> Student Login
              </div>
              <div className="login-card-subtitle">For enrolled students</div>
              {stuerr && <div className="login-err"><span>⚠</span>{stuerr}</div>}
              <div className="login-field">
                <label className="login-label">Username</label>
                <input className="login-input" type="text" value={stuusername} onChange={e => setStuUsername(e.target.value)} autoComplete="username" placeholder="Enter your username" required />
              </div>
              <div className="login-field" style={{ marginBottom: '18px' }}>
                <label className="login-label">Password</label>
                <input className="login-input" type="password" value={stupassword} onChange={e => setStupassword(e.target.value)} autoComplete="current-password" placeholder="Enter your password" required />
              </div>
              <button type="submit" className="login-btn-stu">Sign In as Student</button>
            </div>
          </form>
        </div>

        {}
        <p style={{ position: 'relative', zIndex: 1, marginTop: 'clamp(24px, 4vw, 40px)', color: '#94a3b8', fontSize: '0.75rem', letterSpacing: '0.06em', textAlign: 'center' }}>
          © GoQuiz · Secure Examination Platform
        </p>
      </div>
    </>
  );
}

export default Login
