import React, { useState, useRef, useCallback, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useToast } from './Toast';

const SAMPLES = {
  c: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}
`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}
`,
  python: `print("Hello, World!")`,
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
`
};

function Compiler() {
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
  const [language, setLanguage] = useState('c');
  const [code, setCode] = useState(SAMPLES['c']);
  const [compilationOutput, setCompilationOutput] = useState('');
  const [stdinValue, setStdinValue] = useState('');
  const editorRef = useRef(null);
  const [questions, setQuestions] = useState([]); // [{ id, question_title, question_description }]
  const [selectedQuestionId, setSelectedQuestionId] = useState('');
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questionsError, setQuestionsError] = useState('');

  function htmlToText(html) {
    if (!html) return '';
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    setCode(SAMPLES[lang] || '');
    setCompilationOutput('');
  };

  const handleEditorMount = useCallback((editor) => {
    editorRef.current = editor;
  }, []);

  // fetch questions when component mounts (uses default semester/branch)
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoadingQuestions(true);
      setQuestionsError('');
      setQuestions([]);
      setSelectedQuestionId('');
      try {
        const res = await axios.get(`http://${import.meta.env.VITE_HOST}:8081/compiler/stu/get-questions`, {
          params: { batch:batch, branch:branch, exam_type: examtype, coursecode:coursecode },
        });
        const data = Array.isArray(res.data) ? res.data : (res.data.questions || []);
        setQuestions(data || []);
        console.log(questions)
        // default select first question if available
        if (Array.isArray(data) && data.length > 0) {
          setSelectedQuestionId(data[0].id ?? data[0].question_id ?? data[0].questionTitle ?? '');
        }
      } catch (err) {
        setQuestionsError('Failed to load questions');
        console.error(err);
      } finally {
        setLoadingQuestions(false);
      }
    };

    fetchQuestions();
  }, [semester, branch]);

  const handleRun = async () => {
    setRunState('running'); setSubmitState('idle'); setCompilationOutput('');
    try {
      const payload = {
        questionId: selectedQuestionId,
        language,
        source_code: code,
        stdin: stdinValue || '',
        expectedoutput: ''
      };

      const submitRes = await axios.post(`http://${import.meta.env.VITE_HOST}:8081/submit`, payload, {
        headers: { 'Content-Type': 'application/json' }
      });

      const submitData = submitRes.data;
      const submissionId = submitData.submissionId || submitData.id || submitData.submissionID;

      if (!submissionId) {
        throw new Error('No submissionId returned from /submit');
      }

      setRunState('polling');

      // Poll for result
      const timeoutMs = 30000;
      const pollInterval = 1000;
      const start = Date.now();
      let result = null;

      while (Date.now() - start < timeoutMs) {
        try {
          const res = await axios.get(`http://${import.meta.env.VITE_HOST}:8081/result/${encodeURIComponent(submissionId)}`);
          const data = res.data;
          result = data;
          if (data && (data.status === 'DONE' || (typeof data.status === 'string' && data.status.toUpperCase() === 'DONE'))) {
            break;
          }
        } catch (e) {
          // ignore and retry
        }
        await new Promise((r) => setTimeout(r, pollInterval));
      }

      if (!result) {
        throw new Error('Timed out waiting for result');
      }

      // Parse result.resultJson into object if it's a string
      let parsedResultJson = null;
      if (result.resultJson && typeof result.resultJson === 'string') {
        try {
          parsedResultJson = JSON.parse(result.resultJson);
        } catch (e) {
          parsedResultJson = { raw: result.resultJson, parseError: e.message };
        }
      } else {
        parsedResultJson = result.resultJson;
      }

      const display = {
        submissionId,
        id: result.id,
        language: result.language,
        sourceCode: result.sourceCode || result.source_code || code,
        stdin: result.stdin || '',
        status: result.status,
        expectedOutput: result.expectedOutput || result.expectedoutput || '',
        createdAt: result.createdAt,
        resultJsonParsed: parsedResultJson,
      };

      let outText = '';

      if (parsedResultJson && parsedResultJson.stdout != null && parsedResultJson.stdout !== '') {
        outText = parsedResultJson.stdout;
      } else if (parsedResultJson && parsedResultJson.compile_output != null && parsedResultJson.compile_output !== '') {
        outText = parsedResultJson.compile_output;
      } else if (parsedResultJson && parsedResultJson.stderr != null && parsedResultJson.stderr !== '') {
        outText = parsedResultJson.stderr;
      } else if (result && result.stdout != null && result.stdout !== '') {
        outText = result.stdout;
      } else if (result && result.compile_output != null && result.compile_output !== '') {
        outText = result.compile_output;
      } else if (result && result.stderr != null && result.stderr !== '') {
        outText = result.stderr;
      } else {
        outText = JSON.stringify(display, null, 2);
      }

      if (typeof outText !== 'string') {
        try {
          outText = String(outText);
        } catch (e) {
          outText = JSON.stringify(outText, null, 2);
        }
      }

      setCompilationOutput(outText);
      setRunState('done');
      setActiveTab('output');
    } catch (err) {
      setCompilationOutput('Run failed: ' + String(err));
      setRunState('error');
      setActiveTab('output');
    }
  };

  const handleSubmit = async () => {
    if (!selectedQuestion) {
      toast.warning('No Question Selected', 'Please select a question before submitting.');
      return;
    }

    setSubmitState('submitting'); setRunState('idle');

    const body = {
      id: selectedQuestion.id || selectedQuestion.question_id,
      batch: batch,
      branch: branch,
      semester: semester,
      coursecode: coursecode,
      examType: examtype,
      section: section,
      username: username,
      question_title: selectedQuestion.question_title,
      source_code: code,
      marks: 0, // Assuming marks are part of the question object
    };

    try {
      const response = await axios.post(`http://${import.meta.env.VITE_HOST}:8081/student/submit`, body, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.status === 200) {
        setSubmitState('success');
        const details = location.state;
        // navigate("/student", { state: { details, token } });
      }
    } catch (err) {
      console.error(err);
      let errorMessage = 'Failed to submit code.';
      if (err.response) {
        errorMessage += ` Server responded with ${err.response.status}: ${err.response.data}`;
      } else if (err.request) {
        errorMessage += ' No response from server.';
      } else {
        errorMessage += ` ${err.message}`;
      }
      setCompilationOutput(errorMessage);
      setSubmitState('error');
    }
  };

  const selectedQuestion = questions.find(q => {
    if (!selectedQuestionId) return false;
    return q.id === selectedQuestionId || q.question_id === selectedQuestionId || q.questionTitle === selectedQuestionId;
  }) || {};

  // helper to render description (show only question_description if present,
  // otherwise show only the first test case + expected output).
  // ALWAYS show only ONE example (first).
  // ── EXAM SECURITY ──
  useEffect(() => {
    // 1. Block keyboard shortcuts
    const blockKey = (e) => {
      if (e.key === 'PrintScreen') { e.preventDefault(); return; }
      if (e.key === 'F12') { e.preventDefault(); return; }
      if (e.ctrlKey || e.metaKey) {
        const k = e.key.toLowerCase();
        if (['c','x','a','s','p','u','i','v','r','w','t','n'].includes(k)) {
          e.preventDefault(); e.stopPropagation(); return;
        }
      }
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); }
    };

    // 2. Block clipboard / selection / right-click
    const stop = (e) => { e.preventDefault(); e.stopPropagation(); };

    // 3. Tab switch detection
    const blockVis = () => {
      if (document.visibilityState === 'hidden') {
        tabCountRef.current += 1;
        if (tabCountRef.current >= 2) {
          handleSubmit();
        } else {
          setSecWarning({ msg: '⚠ Tab switching detected. Auto-submit on next attempt.', remaining: 1 });
          setTimeout(() => setSecWarning(null), 4000);
        }
      }
    };

    document.addEventListener('keydown', blockKey, true);
    document.addEventListener('keyup', (e) => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); } }, true);
    document.addEventListener('contextmenu', stop, true);
    document.addEventListener('copy', stop, true);
    document.addEventListener('cut', stop, true);
    document.addEventListener('selectstart', stop, true);
    document.addEventListener('dragstart', stop, true);
    document.addEventListener('visibilitychange', blockVis);

    return () => {
      document.removeEventListener('keydown', blockKey, true);
      document.removeEventListener('contextmenu', stop, true);
      document.removeEventListener('copy', stop, true);
      document.removeEventListener('cut', stop, true);
      document.removeEventListener('selectstart', stop, true);
      document.removeEventListener('dragstart', stop, true);
      document.removeEventListener('visibilitychange', blockVis);
    };
  }, []);

  // 4. Fullscreen lock — re-enter immediately on any exit
  useEffect(() => {
    const onFSChange = () => {
      if (!document.fullscreenElement) {
        escCountRef.current += 1;
        const count = escCountRef.current;
        if (count >= 3) { handleSubmit(); return; }
        setSecWarning({ msg: '⚠ Fullscreen exit not allowed! Returning to exam...', remaining: 3 - count });
        setTimeout(() => {
          const el = document.documentElement;
          const req = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
          if (req) req.call(el).catch(() => {});
          setTimeout(() => setSecWarning(null), 2000);
        }, 80);
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

  // ── Timer countdown ──
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const renderDescription = (q) => {
    const desc = (q.question_description ?? q.question_descrption ?? q.description ?? '').toString().trim();
    const inputs  = Array.isArray(q.testCases)       ? q.testCases       : [];
    const outputs = Array.isArray(q.testCasesOutput) ? q.testCasesOutput : [];
    const marks   = q.marks ?? null;
    const title   = q.question_title ?? q.title ?? q.questionTitle ?? '';

    const exampleBlock = (label, value, idx) => (
      <div key={idx} style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '8px' }}>
          Example {idx + 1}
        </div>
        <div style={{ background: '#f1f5f9', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Input</span>
            <pre style={{ margin: '4px 0 0', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#1e293b', whiteSpace: 'pre-wrap', wordBreak: 'break-all', lineHeight: 1.6 }}>{String(value ?? '')}</pre>
          </div>
          {outputs[idx] !== undefined && outputs[idx] !== '' && (
            <div style={{ padding: '10px 14px' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Output</span>
              <pre style={{ margin: '4px 0 0', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#4ade80', whiteSpace: 'pre-wrap', wordBreak: 'break-all', lineHeight: 1.6 }}>{String(outputs[idx])}</pre>
            </div>
          )}
        </div>
      </div>
    );

    return (
      <div>
        {/* ── Question title ── */}
        {title && (
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '10px', lineHeight: 1.4 }}>
            {title}
          </h2>
        )}

        {/* ── Meta bar: marks badge ── */}
        {marks !== null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '99px', background: 'rgba(250,204,21,0.1)', color: '#fbbf24', border: '1px solid rgba(250,204,21,0.25)', letterSpacing: '0.04em' }}>
              {marks} Marks
            </span>
          </div>
        )}

        {/* ── Divider ── */}
        <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)', marginBottom: '16px' }} />

        {/* ── Problem description ── */}
        {desc ? (
          <div style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.8, marginBottom: '20px', whiteSpace: 'pre-wrap' }}>
            {htmlToText(desc)}
          </div>
        ) : (
          inputs.length === 0 && (
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.2)', fontStyle: 'italic', marginBottom: '20px' }}>
              No description provided.
            </div>
          )
        )}

        {/* ── Constraints / notes section placeholder ── */}
        {desc && inputs.length > 0 && (
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', marginBottom: '16px' }} />
        )}

        {/* ── Examples ── */}
        {inputs.length > 0 && (
          <div>
            {inputs.map((inp, idx) => exampleBlock('Example', inp, idx))}
          </div>
        )}

        {/* ── Constraints note ── */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '4px 0 14px' }} />
        <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.6 }}>
          <span style={{ fontWeight: 700, color: '#64748b' }}>Note: </span>
          Submit your solution only when you are satisfied with the output.
        </div>
      </div>
    );
  };

  const [activeTab, setActiveTab] = React.useState('input');
  const [runState, setRunState] = React.useState('idle');
  // ── Security state ──
  const [secWarning, setSecWarning] = React.useState(null);
  const escCountRef = React.useRef(0);
  const tabCountRef = React.useRef(0);
  // ── Timer: 30 min per question ──
  const [timeLeft, setTimeLeft] = React.useState(30 * 60);
  const timerRef = React.useRef(null);      // idle | running | polling | done | error
  const [submitState, setSubmitState] = React.useState('idle'); // idle | submitting | success | error

  // Top bar label: show actual subject name if available, fallback to examtype
  const examLabel = subject || (examtype
    ? examtype.charAt(0).toUpperCase() + examtype.slice(1).toLowerCase() + ' Exam'
    : 'Lab Exam');
  const examMeta = [coursecode, examtype].filter(Boolean).join(' · ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', fontFamily: 'var(--font)', background: '#f8fafc', overflow: 'hidden', userSelect: 'none', WebkitUserSelect: 'none' }}>

      {/* ── Security warning toast ── */}
      {secWarning && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 99999, background: '#7f1d1d', color: '#fecaca', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'var(--font)', fontSize: '0.86rem', fontWeight: 600, borderBottom: '2px solid #ef4444', animation: 'slideDown 0.3s ease' }}>
          <span>{secWarning.msg}</span>
          <span style={{ background: 'rgba(239,68,68,0.25)', padding: '3px 12px', borderRadius: '99px', fontSize: '0.76rem', fontWeight: 700, marginLeft: '16px', whiteSpace: 'nowrap' }}>{secWarning.remaining} warning{secWarning.remaining !== 1 ? 's' : ''} left — then auto-submit</span>
        </div>
      )}
      <style>{`
        .lang-btn { padding: 6px 14px; border-radius: 6px; border: 1.5px solid #e2e8f0; background: #fff; color: #64748b; font-family: var(--font); font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.18s; letter-spacing: 0.03em; }
        .lang-btn:hover { border-color: var(--accent); color: var(--accent); background: rgba(0,180,216,0.05); }
        .lang-btn.active { background: var(--accent); border-color: var(--accent); color: #fff; }
        .tab-btn { flex: 1; padding: 9px 6px; background: transparent; border: none; border-bottom: 2px solid transparent; font-family: var(--font); font-size: 0.75rem; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; cursor: pointer; color: rgba(255,255,255,0.4); transition: all 0.18s; }
        .tab-btn.active { color: var(--accent); border-bottom-color: var(--accent); background: rgba(0,180,216,0.04); }
        .tab-btn:hover:not(.active) { color: rgba(255,255,255,0.7); }
        @media (max-width: 768px) { .compiler-main { flex-direction: column !important; } .compiler-left { width: 100% !important; max-height: 40vh; } }


        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; vertical-align: middle; }
        @keyframes successPop { 0%{transform:scale(0.7);opacity:0} 60%{transform:scale(1.15)} 100%{transform:scale(1);opacity:1} }
        .success-pop { animation: successPop 0.4s cubic-bezier(0.4,0,0.2,1) both; }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .fade-in-up { animation: fadeInUp 0.3s ease both; }

        /* ── run button states ── */
        .run-btn-idle   { background: rgba(255,255,255,0.08); border: 1.5px solid rgba(255,255,255,0.25); color: #fff; }
        .run-btn-idle:hover { background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.4); }
        .run-btn-running { background: rgba(0,180,216,0.06); border: 1.5px solid rgba(0,180,216,0.4); color: var(--accent); cursor: not-allowed; }
        .run-btn-done   { background: rgba(16,185,129,0.06); border: 1.5px solid rgba(16,185,129,0.3); color: var(--success); }
        .run-btn-error  { background: rgba(239,68,68,0.06); border: 1.5px solid rgba(239,68,68,0.3); color: var(--danger); }

        /* ── submit button states ── */
        .submit-btn-idle      { background: #10b981; border:none; color:#fff; }
        .submit-btn-idle:hover { box-shadow: none; transform: translateY(-1px); }
        .submit-btn-submitting { background: rgba(16,185,129,0.07); border: 1.5px solid rgba(16,185,129,0.4); color: var(--success); cursor: not-allowed; }
        .submit-btn-success   { background: #10b981; border:none; color:#fff; }
        .submit-btn-error     { background: rgba(239,68,68,0.06); border: 1.5px solid rgba(239,68,68,0.3); color: var(--danger); }

        /* ── output panel result card ── */
        .result-card { border-radius: 10px; padding: 14px 16px; margin-bottom: 10px; }
        .result-card-accepted { background: rgba(16,185,129,0.04); border: 1px solid rgba(16,185,129,0.12); }
        .result-card-error    { background: rgba(239,68,68,0.04); border: 1px solid rgba(239,68,68,0.12); }
        .result-card-neutral  { background: rgba(0,180,216,0.04); border: 1px solid rgba(0,180,216,0.18); }
        .result-label { font-size: 0.68rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 6px; }
        .result-label-ok  { color: #10b981; }
        .result-label-err { color: #f87171; }
        .result-label-neu { color: var(--accent); }

        /* ── skeleton shimmer ── */
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .skeleton-line {
          border-radius: 5px;
          background: linear-gradient(90deg, rgba(0,0,0,0.03) 25%, rgba(0,0,0,0.06) 50%, rgba(0,0,0,0.03) 75%);
          background-size: 800px 100%;
          animation: shimmer 1.4s infinite linear;
        }

        /* ── verdict badge (LeetCode style) ── */
        @keyframes verdictReveal {
          0%   { opacity:0; transform: scale(0.85) translateY(6px); }
          60%  { transform: scale(1.04) translateY(-2px); }
          100% { opacity:1; transform: scale(1) translateY(0); }
        }
        .verdict-badge {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 6px 14px; border-radius: 99px;
          font-size: 0.82rem; font-weight: 800; letter-spacing: 0.05em;
          animation: verdictReveal 0.45s cubic-bezier(0.4,0,0.2,1) both;
          margin-bottom: 10px;
        }
        .verdict-ac  { background: rgba(16,185,129,0.08); color: var(--success); border: 1px solid rgba(16,185,129,0.18); }
        .verdict-err { background: rgba(239,68,68,0.07);  color: var(--danger); border: 1px solid rgba(239,68,68,0.15); }

        /* pulseRing removed */
      `}</style>

      {/* ── TOP BAR ── */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', height: '52px', background: 'var(--primary-dark)', borderBottom: '2px solid var(--accent)', flexShrink: 0, flexWrap: 'wrap', gap: '8px' }}>

        {/* Left: exam name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0', minWidth: 0 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.02em', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '420px' }}>
              {examLabel}
            </div>
            {examMeta && (
              <div style={{ color: 'rgba(0,212,255,0.6)', fontSize: '0.68rem', letterSpacing: '0.08em', lineHeight: 1.2, fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                {examMeta}
              </div>
            )}
          </div>
        </div>

        {/* Right: buttons */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>

          {/* RUN button */}
          <button
            onClick={runState === 'idle' || runState === 'done' || runState === 'error' ? handleRun : undefined}
            disabled={runState === 'running' || runState === 'polling' || submitState === 'submitting'}
            className={`svec-btn run-btn-${runState === 'running' || runState === 'polling' ? 'running' : runState === 'done' ? 'done' : runState === 'error' ? 'error' : 'idle'}`}
            style={{ padding: '6px 16px', fontSize: '0.8rem', gap: '7px', transition: 'all 0.2s' }}>
            {runState === 'running' ? (
              <><span className="spinner" /> Compiling...</>
            ) : runState === 'polling' ? (
              <><span className="spinner" /> Running...</>
            ) : runState === 'done' ? (
              <span className="success-pop">✓ Run</span>
            ) : runState === 'error' ? (
              '✕ Run'
            ) : (
              '▶ Run'
            )}
          </button>

          {/* SUBMIT button */}
          <button
            onClick={submitState === 'idle' || submitState === 'error' ? handleSubmit : undefined}
            disabled={submitState === 'submitting' || runState === 'running' || runState === 'polling'}
            className={`svec-btn submit-btn-${submitState}`}
            style={{ padding: '6px 18px', fontSize: '0.8rem', gap: '7px', transition: 'all 0.2s' }}>
            {submitState === 'submitting' ? (
              <><span className="spinner" /> Submitting...</>
            ) : submitState === 'success' ? (
              <span className="success-pop">✓ Submitted!</span>
            ) : submitState === 'error' ? (
              '✕ Submit Failed'
            ) : (
              '✓ Submit'
            )}
          </button>
        </div>
      </div>

      {/* ── SUBMIT SUCCESS OVERLAY ── */}
      {submitState === 'success' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSubmitState('idle')}>
          <div className="success-pop" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '36px 48px', textAlign: 'center', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>🎉</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--success)', marginBottom: '6px' }}>Submitted!</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginBottom: '20px' }}>Your code has been submitted successfully.</div>
            <button onClick={() => setSubmitState('idle')} className="svec-btn"
              style={{ background: '#10b981', color: '#fff', border: 'none', padding: '10px 28px', justifyContent: 'center' }}>
              Continue
            </button>
          </div>
        </div>
      )}

      {/* ── MAIN AREA ── */}
      <div className="compiler-main" style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>

        {/* LEFT: Question panel */}
        <div className="compiler-left" style={{ width: '42%', display: 'flex', flexDirection: 'column', borderRight: '1px solid #e2e8f0', background: '#fff', overflow: 'hidden' }}>

          {/* Question selector — pill buttons like Q1, Q2 */}
          <div style={{ padding: '10px 14px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', flexShrink: 0 }}>
            {loadingQuestions ? (
              <div style={{ color: '#64748b', fontSize: '0.85rem', padding: '4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="spinner" />Loading questions...
              </div>
            ) : questionsError ? (
              <div style={{ color: '#f87171', fontSize: '0.85rem' }}>{questionsError}</div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.64rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap', marginRight: '4px' }}>Questions</span>
                {questions.map((q, idx) => {
                  const qid = q.id ?? q.question_id ?? q.questionTitle ?? idx;
                  const isActive = selectedQuestionId === qid || (!selectedQuestionId && idx === 0);
                  return (
                    <button
                      key={qid}
                      type="button"
                      onClick={() => setSelectedQuestionId(qid)}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '6px',
                        border: isActive ? '1.5px solid var(--accent)' : '1.5px solid #e2e8f0',
                        background: isActive ? 'var(--accent)' : '#fff',
                        color: isActive ? '#fff' : '#64748b',
                        fontFamily: 'var(--font)',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        minWidth: '36px',
                        textAlign: 'center',
                        letterSpacing: '0.02em',
                      }}
                      title={q.question_title ?? q.title ?? `Question ${idx + 1}`}
                    >
                      Q{idx + 1}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Description — LeetCode style, fills remaining space */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 24px' }}>
            {selectedQuestion && Object.keys(selectedQuestion).length
              ? renderDescription(selectedQuestion)
              : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '10px', color: '#cbd5e1' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  <span style={{ fontSize: '0.82rem', fontStyle: 'italic' }}>Select a question above</span>
                </div>
              )}
          </div>
        </div>

        {/* RIGHT: Editor + tabbed bottom panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0 }}>

          {/* Language buttons + Load Sample */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', flexShrink: 0, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginRight: '4px' }}>Language</span>
            {['c', 'cpp', 'python', 'java'].map(lang => (
              <button key={lang} className={`lang-btn${language === lang ? ' active' : ''}`}
                onClick={() => { setLanguage(lang); setCode(SAMPLES[lang] || ''); setCompilationOutput(''); setRunState('idle'); }}>
                {lang === 'cpp' ? 'C++' : lang === 'python' ? 'Python' : lang === 'java' ? 'Java' : 'C'}
              </button>
            ))}
            <div style={{ flex: 1 }} />
            <button onClick={() => { setCode(SAMPLES[language]); setCompilationOutput(''); setRunState('idle'); }}
              style={{ padding: '5px 13px', background: 'rgba(0,180,216,0.1)', border: '1px solid rgba(0,180,216,0.25)', borderRadius: '6px', color: 'var(--accent)', fontFamily: 'var(--font)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', letterSpacing: '0.04em', transition: 'all 0.18s' }}>
              ↺ Load Sample
            </button>
          </div>

          {/* Monaco Editor */}
          <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
            {/* Subtle overlay shimmer while running */}
            {(runState === 'running' || runState === 'polling') && (
              <div style={{ position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'none', background: 'rgba(0,180,216,0.03)', borderLeft: '3px solid var(--accent)', transition: 'all 0.3s' }} />
            )}
            <div
              onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
              style={{ height: '100%', userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none' }}
            >
            <Editor
              height="100%"
              defaultLanguage={language === 'cpp' ? 'cpp' : language}
              language={language === 'cpp' ? 'cpp' : language}
              value={code}
              onChange={(value) => setCode(value ?? '')}
              onMount={(editor, monaco) => {
                handleEditorMount(editor);
                // Disable right-click context menu completely
                editor.onContextMenu((e) => {
                  e.event.preventDefault();
                  e.event.stopPropagation();
                  e.event.browserEvent.preventDefault();
                  e.event.browserEvent.stopPropagation();
                });
                // Block all copy/cut/select shortcuts inside Monaco
                editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyC, () => {});
                editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyX, () => {});
                editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyA, () => {});
                editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {});
                editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyP, () => {});
                // Disable select-all on the editor model level
                editor.onDidChangeCursorSelection(() => {
                  const sel = editor.getSelection();
                  if (sel && !sel.isEmpty()) {
                    // collapse selection immediately
                    editor.setSelection(new monaco.Selection(sel.positionLineNumber, sel.positionColumn, sel.positionLineNumber, sel.positionColumn));
                  }
                });
              }}
              options={{
                minimap: { enabled: false }, fontSize: 14, theme: 'vs',
                fontFamily: 'JetBrains Mono, monospace', padding: { top: 12 },
                scrollBeyondLastLine: false, contextmenu: false,
                // Disable drag-and-drop of text
                dragAndDrop: false,
                // Read-only but we still need to type — keep it editable, just block copy
                selectOnLineNumbers: false,
              }}
            />
            </div>
          </div>

          {/* Tabbed bottom panel */}
          <div style={{ height: '220px', display: 'flex', flexDirection: 'column', borderTop: '1px solid #e2e8f0', background: '#f8fafc', flexShrink: 0 }}>
            <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
              <button className={`tab-btn${activeTab === 'input' ? ' active' : ''}`} onClick={() => setActiveTab('input')}>
                ⌨ Standard Input
              </button>
              <button className={`tab-btn${activeTab === 'output' ? ' active' : ''}`} onClick={() => setActiveTab('output')}
                style={{ borderLeft: '1px solid #e2e8f0' }}>
                {runState === 'running' || runState === 'polling' ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <span className="spinner" style={{ width: 10, height: 10, borderWidth: 1.5 }} /> Running...
                  </span>
                ) : compilationOutput ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: compilationOutput.toLowerCase().includes('error') || compilationOutput.toLowerCase().includes('failed') ? '#ef4444' : '#10b981', display: 'inline-block' }}></span>
                    Output
                  </span>
                ) : '▣ Output'}
              </button>
            </div>

            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {activeTab === 'input' ? (
                <textarea value={stdinValue} onChange={(e) => setStdinValue(e.target.value)}
                  placeholder="Enter input for the program (stdin)..."
                  style={{ flex: 1, resize: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', padding: '12px 14px', background: 'transparent', border: 'none', outline: 'none', color: '#e2e8f0', lineHeight: 1.6 }} />
              ) : (
                <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>

                  {/* Loading state in output panel */}
                  {(runState === 'running' || runState === 'polling') && (
                    <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 600 }}>
                        <span className="spinner" />
                        {runState === 'running' ? 'Compiling your code...' : 'Executing and waiting for result...'}
                      </div>
                      {/* Skeleton lines with shimmer */}
                      {[80, 55, 70, 40, 65, 30].map((w, i) => (
                        <div key={i} className="skeleton-line" style={{ height: 10, width: `${w}%`, marginTop: i === 0 ? 4 : 0, animationDelay: `${i * 0.05}s` }} />
                      ))}
                    </div>
                  )}

                  {/* Actual output with verdict badge */}
                  {compilationOutput && runState !== 'running' && runState !== 'polling' && (() => {
                    const isError = compilationOutput.toLowerCase().includes('error') || compilationOutput.toLowerCase().includes('failed') || compilationOutput.toLowerCase().includes('exception') || compilationOutput.toLowerCase().includes('segmentation');
                    return (
                      <div className="fade-in-up">
                        <span className={`verdict-badge ${isError ? 'verdict-err' : 'verdict-ac'}`}>
                          {isError ? '✕' : '✓'} {isError ? 'Runtime Error / Compile Error' : 'Output'}
                        </span>
                        <div className={`result-card ${isError ? 'result-card-error' : 'result-card-accepted'}`}>
                          <pre style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.83rem', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: isError ? '#ef4444' : '#22c55e' }}>
                            {compilationOutput}
                          </pre>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Empty state */}
                  {!compilationOutput && runState === 'idle' && (
                    <span style={{ color: 'rgba(255,255,255,0.18)', fontSize: '0.85rem', fontStyle: 'italic' }}>Run your code to see output here...</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Compiler;