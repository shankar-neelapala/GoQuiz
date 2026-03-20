import React, { useState } from 'react';

function GroqChatDirect() {
  const [input, setInput] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setQuestion(input);
    setAnswer('');
    setLoading(true);

    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-4-scout-17b-16e-instruct',
          messages: [{ role: 'user', content: input }],
          temperature: 1,
          max_tokens: 1024,
          top_p: 1,
          stream: false
        })
      });

      const data = await res.json();
      const responseText = data.choices?.[0]?.message?.content || 'No response';
      setAnswer(responseText);
    } catch (err) {
      setAnswer('Error: ' + err.message);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '315px', fontFamily: 'var(--font)' }}>
      {}
      <div style={{ padding: '12px 16px', background: 'var(--primary-dark)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          🤖 AI Assistant
        </span>
      </div>

      {}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', background: 'var(--bg)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {question && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ background: 'var(--primary)', color: '#fff', padding: '9px 13px', borderRadius: '14px 14px 4px 14px', fontSize: '0.84rem', maxWidth: '85%', lineHeight: 1.5 }}>
              {question}
            </div>
          </div>
        )}
        {(answer || loading) && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '9px 13px', borderRadius: '14px 14px 14px 4px', fontSize: '0.84rem', maxWidth: '90%', lineHeight: 1.6, whiteSpace: 'pre-wrap',  }}>
              {loading ? (
                <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Thinking...</span>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: (answer || '').replace(/\*\*/g, '<br />') }} />
              )}
            </div>
          </div>
        )}
        {!question && !loading && (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textAlign: 'center', marginTop: '20px', fontStyle: 'italic' }}>
            Ask me anything about your exam or code...
          </div>
        )}
      </div>

      {}
      <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border)', background: 'var(--bg-card)', display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          style={{ flex: 1, resize: 'none', height: '36px', fontSize: '0.88rem', padding: '7px 11px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font)', outline: 'none', color: 'var(--text-primary)', background: 'var(--bg)', lineHeight: 1.4, transition: 'var(--transition)' }}
          placeholder="Ask a question..."
          disabled={loading}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="svec-btn svec-btn-accent"
          style={{ padding: '7px 14px', fontSize: '0.78rem', height: '36px', flexShrink: 0 }}
        >
          {loading ? '...' : '↑'}
        </button>
      </div>
    </div>
  );
}

export default GroqChatDirect;
