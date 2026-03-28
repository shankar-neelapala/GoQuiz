import React from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

function ViewProgress() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Support both: opened in new tab (dataKey query param) OR navigated with state (legacy)
  const dataKey = searchParams.get('dataKey');
  let tabData = null;
  if (dataKey) {
    try {
      const raw = sessionStorage.getItem(dataKey);
      if (raw) tabData = JSON.parse(raw);
    } catch (e) { /* ignore */ }
  }

  const rawQuestions = tabData?.questions || location.state?.questions || [];
  const studentName = tabData?.studentName || tabData?.username || location.state?.studentName || location.state?.username || 'Student';

  // Normalise question shape so the renderer always works with:
  //   { question, opts: [{key, text}], correctAnswer, selectedAnswer }
  //
  // The progress API returns:  { question, options: [str,...], answer, selectedopt }
  // The old MCQ format uses:   { question, optionA/B/C/D, correctOption, selectedOption }
  const questions = rawQuestions.map((q) => {
    // --- flat options[] format (from /student/updateprogress / progress API) ---
    if (Array.isArray(q.options) && q.options.length > 0) {
      const LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];
      return {
        question: q.question,
        opts: q.options.map((text, i) => ({ key: LABELS[i] || String(i + 1), text })),
        correctAnswer: q.answer,       // the correct option text
        selectedAnswer: q.selectedopt, // what student picked (text), null if unattempted
        isTextBased: true,             // correct/selected compared by value not key
      };
    }

    // --- optionA/B/C/D format (legacy MCQ) ---
    return {
      question: q.question,
      opts: [
        { key: 'A', text: q.optionA },
        { key: 'B', text: q.optionB },
        { key: 'C', text: q.optionC },
        { key: 'D', text: q.optionD },
      ].filter(o => o.text),
      correctAnswer: q.correctOption,  // 'A' / 'B' / 'C' / 'D'
      selectedAnswer: q.selectedOption,
      isTextBased: false,
    };
  });

  if (!questions || questions.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div className="svec-error-box" style={{ display: 'inline-block', padding: '24px 40px', borderRadius: 'var(--radius-xl)' }}>
          No question data found.
        </div>
        <div style={{ marginTop: '20px' }}>
          <button className="svec-btn svec-btn-outline" onClick={() => dataKey ? window.close() : navigate(-1)}>
            {dataKey ? '✕ Close Tab' : '← Go Back'}
          </button>
        </div>
      </div>
    );
  }

  // Count correct answers
  const correct = questions.filter(q => {
    if (!q.selectedAnswer) return false;
    if (q.isTextBased) {
      return (q.selectedAnswer || '').trim().toLowerCase() === (q.correctAnswer || '').trim().toLowerCase();
    }
    return q.selectedAnswer === q.correctAnswer;
  }).length;
  const total = questions.length;

  const isCorrectAnswer = (q) => {
    if (!q.selectedAnswer) return false;
    if (q.isTextBased) {
      return (q.selectedAnswer || '').trim().toLowerCase() === (q.correctAnswer || '').trim().toLowerCase();
    }
    return q.selectedAnswer === q.correctAnswer;
  };

  const isOptionCorrect = (q, opt) => {
    if (q.isTextBased) return opt.text?.trim().toLowerCase() === (q.correctAnswer || '').trim().toLowerCase();
    return opt.key === q.correctAnswer;
  };

  const isOptionSelected = (q, opt) => {
    if (q.isTextBased) return opt.text?.trim().toLowerCase() === (q.selectedAnswer || '').trim().toLowerCase();
    return opt.key === q.selectedAnswer;
  };

  return (
    <div style={{ padding: '28px 32px', width: '100%', boxSizing: 'border-box', maxWidth: '900px', margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <button
            className="svec-btn svec-btn-outline"
            style={{ marginRight: '16px', fontSize: '0.82rem' }}
            onClick={() => dataKey ? window.close() : navigate(-1)}
          >
            {dataKey ? '✕ Close Tab' : '← Back'}
          </button>
          <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary)' }}>
            Quiz Attempt — {studentName}
          </span>
        </div>
        <div style={{
          background: correct === total ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.08)',
          color: correct === total ? 'var(--success)' : 'var(--danger)',
          border: `1px solid ${correct === total ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.25)'}`,
          borderRadius: 'var(--radius-xl)',
          padding: '6px 20px',
          fontWeight: 700,
          fontSize: '0.95rem'
        }}>
          Score: {correct} / {total}
        </div>
      </div>

      {/* ── Legend ── */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', fontSize: '0.82rem', flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: 14, height: 14, borderRadius: 3, background: 'rgba(16,185,129,0.18)', border: '1.5px solid var(--success)', display: 'inline-block' }} />
          Correct Answer
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: 14, height: 14, borderRadius: 3, background: 'rgba(239,68,68,0.15)', border: '1.5px solid var(--danger)', display: 'inline-block' }} />
          Wrong Answer
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: 14, height: 14, borderRadius: 3, background: 'rgba(59,130,246,0.12)', border: '1.5px solid #3b82f6', display: 'inline-block' }} />
          Student's Selection
        </span>
      </div>

      {/* ── Questions ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {questions.map((q, qi) => {
          const qCorrect = isCorrectAnswer(q);
          const notAttempted = !q.selectedAnswer;

          return (
            <div key={qi} style={{
              background: 'var(--bg-card)',
              border: `1.5px solid ${qCorrect ? 'rgba(16,185,129,0.35)' : notAttempted ? 'var(--border)' : 'rgba(239,68,68,0.35)'}`,
              borderRadius: 'var(--radius-xl)',
              padding: '20px 24px',
              boxShadow: 'var(--shadow-sm)',
            }}>
              {/* Question number + status badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.78rem', letterSpacing: '0.06em' }}>
                  Q{qi + 1}
                </span>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '2px 12px',
                  borderRadius: '99px',
                  background: qCorrect ? 'rgba(16,185,129,0.1)' : notAttempted ? 'rgba(107,114,128,0.1)' : 'rgba(239,68,68,0.1)',
                  color: qCorrect ? 'var(--success)' : notAttempted ? 'var(--text-muted)' : 'var(--danger)'
                }}>
                  {qCorrect ? '✓ Correct' : notAttempted ? '— Not Attempted' : '✗ Wrong'}
                </span>
              </div>

              {/* Question text */}
              <div style={{ fontWeight: 600, fontSize: '0.97rem', color: 'var(--text-primary)', marginBottom: '16px', lineHeight: 1.5 }}>
                {q.question}
              </div>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {q.opts.map((opt) => {
                  const optCorrect = isOptionCorrect(q, opt);
                  const optSelected = isOptionSelected(q, opt);

                  let bgColor = 'transparent';
                  let borderColor = 'var(--border)';
                  let textColor = 'var(--text-primary)';
                  let icon = null;

                  if (optCorrect && optSelected) {
                    // Student chose correct answer ✓ green
                    bgColor = 'rgba(16,185,129,0.12)';
                    borderColor = 'var(--success)';
                    textColor = '#065f46';
                    icon = '✓';
                  } else if (optCorrect && !optSelected) {
                    // Correct answer but student didn't pick it — show green outline
                    bgColor = 'rgba(16,185,129,0.07)';
                    borderColor = 'rgba(16,185,129,0.4)';
                    textColor = '#065f46';
                    icon = '✓';
                  } else if (optSelected && !optCorrect) {
                    // Student's wrong selection — red
                    bgColor = 'rgba(239,68,68,0.10)';
                    borderColor = 'var(--danger)';
                    textColor = '#991b1b';
                    icon = '✗';
                  }

                  const keyBg = optCorrect ? 'var(--success)' : optSelected ? 'var(--danger)' : 'var(--bg-hover)';
                  const keyColor = (optCorrect || optSelected) ? '#fff' : 'var(--text-muted)';

                  return (
                    <div key={opt.key} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${borderColor}`,
                      background: bgColor,
                      transition: 'all 0.15s',
                    }}>
                      {/* Option key badge */}
                      <span style={{
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        minWidth: '22px',
                        height: '22px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        background: keyBg,
                        color: keyColor,
                        flexShrink: 0,
                      }}>
                        {opt.key}
                      </span>

                      {/* Option text */}
                      <span style={{ flex: 1, fontSize: '0.9rem', color: textColor, fontWeight: (optCorrect || optSelected) ? 600 : 400 }}>
                        {opt.text}
                      </span>

                      {/* Icon (✓ / ✗) */}
                      {icon && (
                        <span style={{ fontWeight: 800, color: optCorrect ? 'var(--success)' : 'var(--danger)', fontSize: '1rem' }}>
                          {icon}
                        </span>
                      )}

                      {/* "Student's Answer" badge */}
                      {optSelected && (
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: optCorrect ? 'var(--success)' : 'var(--danger)',
                          background: optCorrect ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.12)',
                          padding: '1px 8px',
                          borderRadius: '99px',
                          whiteSpace: 'nowrap',
                        }}>
                          Student's Answer
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Show correct answer text when student got it wrong (for text-based format) */}
              {!qCorrect && !notAttempted && q.isTextBased && (
                <div style={{ marginTop: '10px', fontSize: '0.78rem', color: 'var(--success)', fontWeight: 600 }}>
                  ✓ Correct answer: {q.correctAnswer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '32px', textAlign: 'center' }}>
        <button
          className="svec-btn svec-btn-outline"
          onClick={() => dataKey ? window.close() : navigate(-1)}
        >
          {dataKey ? '✕ Close Tab' : '← Back to Results'}
        </button>
      </div>
    </div>
  );
}

export default ViewProgress;
