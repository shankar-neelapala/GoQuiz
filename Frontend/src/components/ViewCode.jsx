import React, { useState, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from './Toast';

const LANG_DISPLAY = { c: 'C', cpp: 'C++', java: 'Java', python: 'Python', python3: 'Python' };

function ViewCode() {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();

  // Support both: opened in new tab (dataKey) OR navigated with state (legacy)
  const dataKey = searchParams.get('dataKey');
  let tabData = null;
  if (dataKey) {
    try {
      const raw = sessionStorage.getItem(dataKey);
      if (raw) tabData = JSON.parse(raw);
    } catch (e) { /* ignore */ }
  }

  const sourceCode = tabData?.sourceCode ?? location.state?.sourceCode ?? '';
  const initialLang = tabData?.language ?? location.state?.language ?? 'c';
  const username = tabData?.username ?? location.state?.username ?? 'Student';
  const questionTitle = tabData?.questionTitle ?? location.state?.questionTitle ?? '';
  const marks = tabData?.marks ?? location.state?.marks;
  const status = tabData?.status ?? location.state?.status;
  const token = tabData?.token ?? location.state?.token;

  const [code, setCode] = useState(sourceCode);
  const [language] = useState(initialLang);
  const [stdinValue, setStdinValue] = useState('');
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const editorRef = useRef(null);
  const pollRef = useRef(null);

  const handleEditorMount = useCallback((editor) => {
    editorRef.current = editor;
  }, []);

  // Map language string to Monaco editor language identifier
  const getMonacoLang = (lang) => {
    const map = { c: 'c', cpp: 'cpp', java: 'java', python: 'python', python3: 'python' };
    return map[lang?.toLowerCase()] || 'c';
  };

  const handleRun = async () => {
    setRunning(true);
    setOutput('');
    try {
      // Step 1: Submit run request via Kafka (POST /run)
      const runRes = await axios.post(
        `http://${import.meta.env.VITE_HOST}:8081/run`,
        {
          language: language,
          source_code: code,
          stdin: stdinValue,
          expectedoutput: ''
        }
      );
      const submissionId = runRes.data?.submissionId;
      if (!submissionId) {
        toast.error('Error', 'No submission ID returned.');
        setRunning(false);
        return;
      }
      setOutput('Running...');

      // Step 2: Poll for result
      let attempts = 0;
      const maxAttempts = 30;
      const poll = async () => {
        if (attempts >= maxAttempts) {
          setOutput('Timed out waiting for result.');
          setRunning(false);
          return;
        }
        attempts++;
        try {
          const resultRes = await axios.get(
            `http://${import.meta.env.VITE_HOST}:8081/result/${submissionId}`
          );
          const sub = resultRes.data;
          if (sub.status === 'DONE' || sub.status === 'ERROR') {
            setRunning(false);
            if (sub.status === 'ERROR') {
              setOutput('Execution error:\n' + (sub.resultJson || ''));
              return;
            }
            // Parse Judge0 result JSON
            try {
              const r = JSON.parse(sub.resultJson);
              let out = '';
              if (r.compile_output) out += `Compile Output:\n${r.compile_output}\n`;
              if (r.stderr) out += `Stderr:\n${r.stderr}\n`;
              if (r.stdout) out += r.stdout;
              if (!r.stdout && !r.stderr && !r.compile_output) out = '(No output)';
              setOutput(out.trim());
            } catch {
              setOutput(sub.resultJson || '(No output)');
            }
          } else {
            // Still PENDING or RUNNING
            pollRef.current = setTimeout(poll, 1200);
          }
        } catch {
          pollRef.current = setTimeout(poll, 1500);
        }
      };
      pollRef.current = setTimeout(poll, 1000);
    } catch (err) {
      toast.error('Error', err?.response?.data?.message || err.message || 'Failed to run code.');
      setRunning(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-base)' }}>
      {/* Top bar */}
      <div className="svec-topbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            className="svec-btn svec-btn-outline"
            style={{ padding: '5px 14px', fontSize: '0.8rem' }}
            onClick={() => dataKey ? window.close() : navigate(-1)}
          >
            {dataKey ? '✕ Close Tab' : '← Back'}
          </button>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary)' }}>
            Code Review — <span style={{ color: 'var(--text-primary)' }}>{username}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {questionTitle && (
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              📝 {questionTitle}
            </span>
          )}
          {marks !== undefined && (
            <span style={{
              background: marks > 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              color: marks > 0 ? 'var(--success)' : 'var(--danger)',
              padding: '3px 12px', borderRadius: '99px', fontWeight: 700, fontSize: '0.82rem'
            }}>
              Marks: {marks}
            </span>
          )}
          {status && (
            <span style={{
              background: status === 'ACCEPTED' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
              color: status === 'ACCEPTED' ? 'var(--success)' : '#d97706',
              padding: '3px 12px', borderRadius: '99px', fontWeight: 600, fontSize: '0.78rem'
            }}>
              {status}
            </span>
          )}
          <span style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1', padding: '3px 12px', borderRadius: '99px', fontWeight: 700, fontSize: '0.82rem' }}>
            {LANG_DISPLAY[language] || language?.toUpperCase() || 'C'}
          </span>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'row', overflow: 'hidden', gap: 0 }}>
        {/* Editor panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <Editor
              height="100%"
              language={getMonacoLang(language)}
              value={code}
              onChange={(val) => setCode(val || '')}
              onMount={handleEditorMount}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                automaticLayout: true,
              }}
            />
          </div>
        </div>

        {/* Right panel: stdin + output + run */}
        <div style={{
          width: '340px',
          minWidth: '260px',
          display: 'flex',
          flexDirection: 'column',
          borderLeft: '1px solid var(--border)',
          background: 'var(--bg-card)',
          padding: '16px',
          gap: '12px',
          overflow: 'auto'
        }}>
          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>
            STDIN (Custom Input)
          </div>
          <textarea
            value={stdinValue}
            onChange={(e) => setStdinValue(e.target.value)}
            placeholder="Enter custom input here..."
            rows={5}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              background: '#1e1e2e',
              color: '#cdd6f4',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '10px',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              resize: 'vertical'
            }}
          />

          <button
            className="svec-btn"
            style={{
              background: running ? 'rgba(99,102,241,0.4)' : 'var(--primary)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: '10px 0',
              fontWeight: 700,
              fontSize: '0.92rem',
              cursor: running ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background 0.2s'
            }}
            disabled={running}
            onClick={handleRun}
          >
            {running ? (
              <>
                <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                Running...
              </>
            ) : '▶ Run Code'}
          </button>

          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-secondary)', letterSpacing: '0.04em', marginTop: '4px' }}>
            OUTPUT
          </div>
          <div style={{
            flex: 1,
            minHeight: '180px',
            background: '#1e1e2e',
            color: output.startsWith('Error') || output.startsWith('Timed') ? '#f38ba8' : '#a6e3a1',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            padding: '12px',
            fontFamily: 'monospace',
            fontSize: '0.83rem',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            overflowY: 'auto'
          }}>
            {output || <span style={{ color: '#585b70', fontStyle: 'italic' }}>Output will appear here after running.</span>}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default ViewCode;
