import React from 'react'
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from './Toast';

function Exam() {
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const name = location.state?.name || null;
  const batch = location.state?.batch || null;
  const branch = location.state?.branch || null;
  const coursecode = location.state?.coursecode || null;
  const examtype = location.state?.examtype || null;
  const subject = location.state?.subject || null;
  const semester = location.state?.semester || null;
  const section = location.state?.section || null;
  const username = location.state?.username || null;
  const image = location.state?.image || null;
  const role = location.state?.role || null;
  let sess = location.state?.session || false;
  const token = location.state?.token || false;
  const [session, setSession] = useState(sess);
  const [questions, setQuestions] = useState([]);
  const [qno, setQno] = useState(0);
  const [originalans, setOriginalans] = useState(new Array(20).fill(null));
  const [answers, setAnswers] = useState(new Array(20).fill(null));
  const [timeLeft, setTimeLeft] = useState(20 * 60);
  const [isActive, setIsActive] = useState(true);
  const [status, setStatus] = useState("incomplete");
  const intervalRef = useRef(null);
  const details = [{ batch, branch, name, semester, section, username, role, image }];
  const [exitcount, setExitcount] = useState(0);
  const [tabcount, setTabcount] = useState(0);
  const [fullscreen, setFullscreen] = useState(true);
  const [getAnswers, setGetAnswers] = useState(new Array(20).fill(null));
  const [isreloaded, setIsreloaded] = useState(false);
  const submitRef = useRef(false);
  const isSubmitted = useRef(false);
  // ── Security state ──
  const [secWarning, setSecWarning] = useState(null); // { msg, count }
  const escCountRef = useRef(0);
  const tabCountRef = useRef(0);
  const examStateKey = `examState_${username}_${examtype}_${coursecode}`;

  useEffect(() => {
    const handleUnload = () => { console.log("Page is closing, cleanup here."); };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  useEffect(() => {
    const reloaded = sessionStorage.getItem('reloaded');
    if (reloaded === 'true') {
      setIsreloaded(true); setFullscreen(false); togglePause(); setIsActive(false);
    } else {
      window.addEventListener("beforeunload", (ev) => {
        ev.returnValue = "Exam cannot be submitted due to system sleep or power off.";
        toast.error('Exam Disrupted', 'Exam cannot be submitted due to system sleep or power off.');
      });
    }
  }, []);

  // ── EXAM SECURITY ──
  // Note: browsers cannot be prevented from exiting fullscreen via Esc with preventDefault.
  // The real lock is: catch fullscreenchange and instantly re-request fullscreen.
  useEffect(() => {
    // ── 1. Block keyboard shortcuts ──
    const blockKey = (e) => {
      // Always block these
      if (e.key === 'PrintScreen') { e.preventDefault(); return; }
      if (e.key === 'F12') { e.preventDefault(); return; }
      if (e.ctrlKey || e.metaKey) {
        const k = e.key.toLowerCase();
        if (['c','x','a','s','p','u','i','v','r','w','t','n'].includes(k)) {
          e.preventDefault(); e.stopPropagation(); return;
        }
      }
      // Esc — prevent default (helps in non-fullscreen cases), real lock is fullscreenchange
      if (e.key === 'Escape') {
        e.preventDefault(); e.stopPropagation();
      }
    };

    // ── 2. Block clipboard / selection / right-click ──
    const stop = (e) => { e.preventDefault(); e.stopPropagation(); };

    document.addEventListener('keydown', blockKey, true);
    document.addEventListener('keyup', (e) => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); } }, true);
    document.addEventListener('contextmenu', stop, true);
    document.addEventListener('copy', stop, true);
    document.addEventListener('cut', stop, true);
    document.addEventListener('paste', stop, true);
    document.addEventListener('selectstart', stop, true);
    document.addEventListener('dragstart', stop, true);

    return () => {
      document.removeEventListener('keydown', blockKey, true);
      document.removeEventListener('contextmenu', stop, true);
      document.removeEventListener('copy', stop, true);
      document.removeEventListener('cut', stop, true);
      document.removeEventListener('paste', stop, true);
      document.removeEventListener('selectstart', stop, true);
      document.removeEventListener('dragstart', stop, true);
    };
  }, []);

  // ── 3. Fullscreen lock — immediately re-enter on any exit ──
  useEffect(() => {
    const onFSChange = () => {
      if (!document.fullscreenElement) {
        // Count the violation
        escCountRef.current += 1;
        const count = escCountRef.current;
        setExitcount(count);

        if (count >= 5) {
          // Auto-submit on 5th violation
          calculatemarks(null, 'auto-submitted-security');
          return;
        }

        // Show warning immediately
        setExitcount(count);
        setSecWarning({
          msg: 'Exiting fullscreen is not allowed during the exam.',
          remaining: 5 - count,
          type: 'esc'
        });

        // Re-enter fullscreen immediately — no visible gap
        const el = document.documentElement;
        const req = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
        if (req) req.call(el).catch(() => {});
        // Clear warning after 2s
        setTimeout(() => setSecWarning(null), 2000);
      }
    };

    document.addEventListener('fullscreenchange', onFSChange);
    document.addEventListener('webkitfullscreenchange', onFSChange);
    document.addEventListener('mozfullscreenchange', onFSChange);
    document.addEventListener('MSFullscreenChange', onFSChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFSChange);
      document.removeEventListener('webkitfullscreenchange', onFSChange);
      document.removeEventListener('mozfullscreenchange', onFSChange);
      document.removeEventListener('MSFullscreenChange', onFSChange);
    };
  }, []);

  useEffect(() => {
    const handleVisibilityChange = (e) => {
      if (document.visibilityState === 'hidden') {
        tabCountRef.current += 1;
        const count = tabCountRef.current;
        setTabcount(count);
        if (count >= 5) {
          calculatemarks(e, 'auto-submitted-tab-switch');
        } else {
          setSecWarning({ msg: `Tab switching is not allowed during the exam. (${count}/5)`, count, remaining: 5 - count, type: 'tab' });
          setTimeout(() => setSecWarning(null), 4000);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => { document.removeEventListener('visibilitychange', handleVisibilityChange); };
  }, [questions, originalans, answers]);

  const goFullscreen = () => {
    const elem = document.documentElement;
    const el = document.getElementById("fullscreenbutton");
    if (elem.requestFullscreen) {
      if (el) { el.style.display = "none"; }
      elem.requestFullscreen().catch(err => console.error('Fullscreen error:', err));
    } else if (elem.webkitRequestFullscreen) {
      if (el) { el.style.display = "none"; }
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      if (el) { el.style.display = "none"; }
      elem.msRequestFullscreen();
    }
  };

  const exitFullscreen = () => {
    submitRef.current = true;
    if (document.exitFullscreen) { document.exitFullscreen(); }
    else if (document.webkitExitFullscreen) { document.webkitExitFullscreen(); }
    else if (document.mozCancelFullScreen) { document.mozCancelFullScreen(); }
    else if (document.msExitFullscreen) { document.msExitFullscreen(); }
  };

  const updateprogress = (e, id, username, batch, exam_type, branch, semester, coursecode, question_no, question, options, answer, selectedopt) => {
    e.preventDefault();
    axios.put(`http://${import.meta.env.VITE_HOST}:8080/student/updateprogress`,
      { id, username, batch, exam_type, branch, semester, coursecode, question_no, question, options, answer, selectedopt },
      { headers: { Authorization: token, 'Content-Type': 'application/json' }, withCredentials: true }
    ).catch(err => toast.error('Error', err?.response?.data?.message || err.message || String(err)));
  };

  const calculatemarks = (e, submissionStatus) => {
    if (isSubmitted.current) { if (e && e.preventDefault) e.preventDefault(); return; }
    isSubmitted.current = true;
    if (e && e.preventDefault) e.preventDefault();
    const finalStatus = submissionStatus || status;
    axios.post(`http://${import.meta.env.VITE_HOST}:8080/common/uploadresults`,
      { batch, branch, semester, coursecode, examType: examtype, section, username, originalans, attemptedans: getAnswers, status: finalStatus },
      { headers: { Authorization: token, 'Content-Type': 'application/json' }, withCredentials: true }
    ).catch(err => toast.error('Error', err?.response?.data?.message || err.message || String(err)));
    setSession(false);
    toast.success('Exam Submitted', 'Your answers have been recorded successfully.');
    let t = true;
    if (t) { navigate("/student", { state: { details, token } }); }
  };

  const saveExamState = () => {
    const examState = { answers, timeLeft, qno };
    localStorage.setItem(examStateKey, JSON.stringify(examState));
  };

  const restoreExamState = () => {
    const savedState = localStorage.getItem(examStateKey);
    if (savedState) {
      const { answers: savedAnswers, timeLeft: savedTimeLeft, qno: savedQno } = JSON.parse(savedState);
      setAnswers(savedAnswers); setTimeLeft(savedTimeLeft); setQno(savedQno);
    }
  };

  useEffect(() => {
    if (session) {
      axios.get(`http://${import.meta.env.VITE_HOST}:8080/student/examquestions`, {
        headers: { Authorization: token }, withCredentials: true,
        params: { username, batch, branch, coursecode, examtype }
      })
      .then((res) => {
        setQuestions(res.data);
        restoreExamState();
        const ans = res.data.map(q => q.answer);
        setOriginalans(ans);
        const selectedoption = res.data.map(q => q.selectedopt);
        setAnswers(selectedoption);
        setGetAnswers(selectedoption);
        setIsActive(true);
        window.addEventListener("beforeunload", (ev) => {
          ev.preventDefault();
          sessionStorage.setItem('reloaded', 'false');
          setIsreloaded(true);
        });
      })
      .catch(err => toast.error('Error', err?.response?.data?.message || err.message || String(err)));
    }
  }, [batch, branch, coursecode, examtype]);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev > 0) { saveExamState(); return prev - 1; }
          else { clearInterval(intervalRef.current); calculatemarks(null, "auto-submitted"); return 0; }
        });
      }, 1000);
    } else { clearInterval(intervalRef.current); }
    return () => clearInterval(intervalRef.current);
  }, [isActive]);

  const togglePause = () => { setIsActive((prev) => !prev); };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const getTimerClass = () => {
    if (timeLeft <= 60) return 'svec-exam-timer danger';
    if (timeLeft <= 300) return 'svec-exam-timer warning';
    return 'svec-exam-timer';
  };

  if (session === false) {
    return (<div className="svec-error-state"><div className="svec-error-box">ERROR: GO BACK TO LOGIN.</div></div>);
  }

  return (
    <div style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none' }}>
      {console.log(isreloaded)}

      {/* ── Security warning — blur overlay ── */}
      {secWarning && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font)', animation: 'secWarnIn 0.22s ease' }}>
          <style>{`@keyframes secWarnIn{from{opacity:0;transform:scale(0.94)}to{opacity:1;transform:scale(1)}}`}</style>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '36px 44px', textAlign: 'center', maxWidth: '420px', width: '90%', boxShadow: '0 24px 80px rgba(0,0,0,0.25)', border: '1px solid #fee2e2', borderTop: '5px solid #ef4444' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fef2f2', border: '2px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', fontSize: '1.6rem' }}>⚠️</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', marginBottom: '10px' }}>
              {secWarning.type === 'tab' ? 'Tab Switch Detected' : 'Fullscreen Violation'}
            </div>
            <div style={{ fontSize: '0.88rem', color: '#6b7280', lineHeight: 1.65, marginBottom: '18px' }}>{secWarning.msg}</div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '24px' }}>
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '10px 18px', minWidth: 90 }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Tab Switches</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#dc2626' }}>{tabcount}<span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>/5</span></div>
              </div>
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '10px 18px', minWidth: 90 }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Esc Exits</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#dc2626' }}>{exitcount}<span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>/5</span></div>
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600, marginBottom: '22px', background: '#fef2f2', padding: '6px 14px', borderRadius: '99px', display: 'inline-block' }}>
              {secWarning.remaining} warning{secWarning.remaining !== 1 ? 's' : ''} left — auto-submit at limit
            </div>
            <button onClick={() => { setSecWarning(null); const el = document.documentElement; const req = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen; if (req) req.call(el).catch(() => {}); }}
              style={{ background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 0', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)', width: '100%', letterSpacing: '0.02em', transition: 'background 0.15s' }}
              onMouseEnter={e => e.target.style.background='#1e40af'}
              onMouseLeave={e => e.target.style.background='#1d4ed8'}>
              ↩ Continue Exam
            </button>
          </div>
        </div>
      )}

      {isreloaded ? (
        <div className="svec-error-state"><div className="svec-error-box">ERROR: PAGE RELOADED.</div></div>
      ) : (
        <>
          {/* fullscreen overlay removed — Esc now re-enters instantly */}

          <form onSubmit={calculatemarks}>
            {/* Top bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: '52px', background: 'var(--primary-dark)', borderBottom: '1px solid #1e40af' }}>
              <div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.88rem', lineHeight: 1.3 }}>
                  {subject || coursecode || 'MCQ Exam'}
                </div>
                {examtype && (
                  <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                    {examtype}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                {/* Violation count badges */}
                {(exitcount > 0 || tabcount > 0) && (
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {tabcount > 0 && (
                      <span title="Tab switches" style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5', fontSize: '0.68rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', letterSpacing: '0.04em' }}>
                        TAB {tabcount}/5
                      </span>
                    )}
                    {exitcount > 0 && (
                      <span title="Fullscreen exits" style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5', fontSize: '0.68rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', letterSpacing: '0.04em' }}>
                        ESC {exitcount}/5
                      </span>
                    )}
                  </div>
                )}
                <span className={getTimerClass()}>
                  {questions.length > 0 ? formatTime(timeLeft) : 'Loading...'}
                </span>
                <button type="submit" className="svec-btn svec-btn-success"
                  style={{ fontSize: '0.82rem', padding: '8px 18px' }}
                  onClick={() => { exitFullscreen(); setStatus("submitted"); }}>
                  ✓ Submit Exam
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', height: 'calc(100vh - 52px)' }}>
              {/* Question Panel */}
              <div style={{ flex: 1, padding: '18px 22px', overflowY: 'auto', background: 'var(--bg)' }}>
                {questions[qno] && (
                  <div>
                    <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', padding: '16px 20px', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                        <span style={{ background: 'var(--primary)', color: '#fff', borderRadius: '6px', padding: '3px 10px', fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.06em' }}>Q{qno + 1}</span>
                        <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.06em' }}>of 20</span>
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.65 }}>
                        {questions[qno].question}
                      </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      {questions[qno].options.map((opt, index) => (
                        <label key={index} className="svec-option-item" style={{ background: answers[qno] === opt ? 'rgba(0,0,0,0.03)' : '', borderColor: answers[qno] === opt ? 'var(--accent)' : '' }}>
                          <input type='radio' id={`qno${qno}option${index}`} name={`qno${qno}`} value={opt}
                            checked={answers[qno] === opt}
                            onChange={() => { const updatedAnswers = [...answers]; updatedAnswers[qno] = opt; setAnswers(updatedAnswers); }}
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                      <button type="button" className="svec-btn svec-btn-outline"
                        onClick={() => { if (qno !== 0) setQno(qno - 1); }}>
                        ← Previous
                      </button>
                      <button type="button" className="svec-btn svec-btn-accent"
                        onClick={(e) => {
                          const updatedAnswers = [...answers];
                          const selectedOption = document.querySelector(`input[name="qno${qno}"]:checked`)?.value;
                          updatedAnswers[qno] = selectedOption;
                          setGetAnswers(updatedAnswers);
                          if (qno < 19) { setQno(qno + 1); } else { setQno(0); }
                          if (answers[qno] === null) { document.getElementById(`qno${qno}`).style.backgroundColor = "var(--danger)"; document.getElementById(`qno${qno}`).style.borderColor = "var(--danger)"; document.getElementById(`qno${qno}`).style.color = "#fff"; }
                          else { document.getElementById(`qno${qno}`).style.backgroundColor = "var(--success)"; document.getElementById(`qno${qno}`).style.borderColor = "var(--success)"; document.getElementById(`qno${qno}`).style.color = "#fff"; }
                          updateprogress(e, questions[qno].id, username, batch, examtype, branch, semester, coursecode, qno + 1, questions[qno].question, questions[qno].options, questions[qno].answer, answers[qno]);
                        }}>
                        Save & Next →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Question Navigator */}
              <div style={{ width: '200px', borderLeft: '1px solid var(--border)', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                  Question Navigator
                </div>
                <div style={{ padding: '12px', display: 'flex', flexWrap: 'wrap', gap: '6px', overflowY: 'auto', flex: 1 }}>
                  {Array.from({ length: 20 }, (_, i) => (
                    <button key={i} type="button" id={`qno${i}`}
                      className={`svec-qno-btn ${getAnswers[i] != null ? 'answered' : ''} ${i === qno ? 'current' : ''}`}
                      style={{ border: i === qno ? '2px solid var(--accent)' : '' }}
                      onClick={() => setQno(i)}>
                      {i + 1}
                    </button>
                  ))}
                </div>
                <div className="svec-legend">
                  <div className="svec-legend-item">
                    <div className="svec-legend-dot" style={{ background: 'var(--success)' }}></div>
                    Answered
                  </div>
                  <div className="svec-legend-item">
                    <div className="svec-legend-dot" style={{ background: 'var(--danger)' }}></div>
                    Not Answered
                  </div>
                </div>
              </div>
            </div>
          </form>
        </>
      )}
    </div>
  );
}

export default Exam;
