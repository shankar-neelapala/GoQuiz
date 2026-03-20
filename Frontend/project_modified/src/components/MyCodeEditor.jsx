import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';

const languages = [
  { label: 'C', value: 'c' },
  { label: 'C++', value: 'cpp' },
  { label: 'Java', value: 'java' },
  { label: 'Python', value: 'python' },
];

function MyCodeEditor() {
  const [code, setCode] = useState('// Write your code here');
  const [language, setLanguage] = useState('cpp');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = async () => {
    setIsRunning(true);
    setOutput('Running...');
    try {
      const response = await axios.post('http://localhost:8080/api/execute', { code, language, input });
      setOutput(response.data.output || 'No output');
    } catch (error) {
      setOutput('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', fontFamily: 'var(--font)' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 14px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Language</span>
        <select value={language} onChange={e => setLanguage(e.target.value)}
          className="dark-select" style={{ minWidth: '120px' }}>
          {languages.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>
        <button onClick={handleRun} disabled={isRunning}
          className="svec-btn svec-btn-accent"
          style={{ padding: '5px 16px', fontSize: '0.8rem', opacity: isRunning ? 0.6 : 1 }}>
          {isRunning ? '⟳ Running...' : '▶ Run'}
        </button>
      </div>

      {/* Editor */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={v => setCode(v ?? '')}
          theme="vs"
          options={{ minimap: { enabled: false }, fontSize: 14, fontFamily: 'JetBrains Mono, monospace', padding: { top: 10 } }}
        />
      </div>

      {/* Bottom panel */}
      <div style={{ display: 'flex', height: '180px', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid #e2e8f0' }}>
          <div style={{ padding: '6px 12px', fontSize: '0.66rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Input</div>
          <textarea value={input} onChange={e => setInput(e.target.value)}
            style={{ flex: 1, resize: 'none', background: 'transparent', border: 'none', outline: 'none', padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#1e293b', lineHeight: 1.6 }} />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '6px 12px', fontSize: '0.66rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Output</div>
          <pre style={{ flex: 1, margin: 0, padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: output.toLowerCase().includes('error') ? '#dc2626' : '#059669', lineHeight: 1.6, overflowY: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {output || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Output appears here...</span>}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default MyCodeEditor;
