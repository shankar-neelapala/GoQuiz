import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

/* ─────────────────────────────────────────────
   GoQuiz Toast System
   Usage anywhere in the app:
     const toast = useToast();
     toast.success('Saved!');
     toast.error('Something went wrong');
     toast.info('Exam starts in 5 minutes');
     toast.warning('Tab switch detected');
     const ok = await toast.confirm('Submit exam?', 'This cannot be undone.');
   ───────────────────────────────────────────── */

const ToastCtx = createContext(null);

export function useToast() {
  return useContext(ToastCtx);
}

/* Individual toast item */
function ToastItem({ id, type, title, message, onRemove }) {
  const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
  const colors = {
    success: { bar: '#10b981', icon: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)' },
    error:   { bar: '#ef4444', icon: '#ef4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.25)' },
    info:    { bar: '#00b4d8', icon: '#00b4d8', bg: 'rgba(0,180,216,0.08)',   border: 'rgba(0,180,216,0.25)' },
    warning: { bar: '#f59e0b', icon: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)' },
  };
  const c = colors[type] || colors.info;

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '12px',
      background: '#1e293b', border: `1px solid ${c.border}`,
      borderLeft: `4px solid ${c.bar}`,
      borderRadius: '10px', padding: '14px 16px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
      minWidth: '320px', maxWidth: '420px',
      animation: 'toastSlideIn 0.28s cubic-bezier(0.34,1.56,0.64,1)',
      fontFamily: 'var(--font, "Outfit", sans-serif)',
    }}>
      {/* Icon */}
      <span style={{
        width: 28, height: 28, borderRadius: '50%',
        background: c.bg, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '0.9rem',
        color: c.icon, fontWeight: 800, flexShrink: 0, marginTop: 1,
      }}>{icons[type]}</span>

      {/* Text */}
      <div style={{ flex: 1 }}>
        {title && (
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f1f5f9', marginBottom: message ? 3 : 0 }}>
            {title}
          </div>
        )}
        {message && (
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.5 }}>{message}</div>
        )}
      </div>

      {/* Close */}
      <button onClick={() => onRemove(id)} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: '#475569', fontSize: '1rem', padding: '0 2px',
        lineHeight: 1, marginTop: 1, flexShrink: 0,
      }}>×</button>
    </div>
  );
}

/* Confirm dialog */
function ConfirmDialog({ title, message, onConfirm, onCancel, confirmLabel = 'Confirm', danger = false }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99998,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#1e293b', border: '1px solid #334155',
        borderRadius: '16px', padding: '28px 32px',
        minWidth: '360px', maxWidth: '460px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        animation: 'confirmIn 0.22s cubic-bezier(0.34,1.56,0.64,1)',
        fontFamily: 'var(--font, "Outfit", sans-serif)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
          <span style={{
            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
            background: danger ? 'rgba(239,68,68,0.12)' : 'rgba(0,180,216,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem',
          }}>
            {danger ? '⚠' : '?'}
          </span>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: '#f1f5f9' }}>{title}</span>
        </div>

        {/* Message */}
        {message && (
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6, margin: '0 0 22px 48px' }}>
            {message}
          </p>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: message ? 0 : 20 }}>
          <button onClick={onCancel} style={{
            padding: '9px 20px', borderRadius: '8px', border: '1.5px solid #334155',
            background: 'transparent', color: '#94a3b8', cursor: 'pointer',
            fontSize: '0.83rem', fontWeight: 600, fontFamily: 'inherit',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.target.style.background = '#334155'; e.target.style.color = '#fff'; }}
          onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#94a3b8'; }}
          >Cancel</button>

          <button onClick={onConfirm} style={{
            padding: '9px 20px', borderRadius: '8px', border: 'none',
            background: danger ? '#ef4444' : '#00b4d8',
            color: '#fff', cursor: 'pointer',
            fontSize: '0.83rem', fontWeight: 700, fontFamily: 'inherit',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.target.style.background = danger ? '#dc2626' : '#0096c7'}
          onMouseLeave={e => e.target.style.background = danger ? '#ef4444' : '#00b4d8'}
          >{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

/* Provider — wrap your app with this */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirm, setConfirm] = useState(null);
  const idRef = useRef(0);

  const remove = useCallback((id) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  const add = useCallback((type, titleOrMsg, message, duration = 3500) => {
    const id = ++idRef.current;
    // If only one string given, use it as title
    const title = message ? titleOrMsg : null;
    const msg   = message ? message    : titleOrMsg;
    setToasts(t => [...t, { id, type, title, message: msg }]);
    setTimeout(() => remove(id), duration);
  }, [remove]);

  const toast = {
    success: (t, m, d) => add('success', t, m, d),
    error:   (t, m, d) => add('error',   t, m, d || 5000),
    info:    (t, m, d) => add('info',    t, m, d),
    warning: (t, m, d) => add('warning', t, m, d || 4500),
    confirm: (title, message, confirmLabel, danger) =>
      new Promise(resolve => {
        setConfirm({
          title, message, confirmLabel, danger,
          onConfirm: () => { setConfirm(null); resolve(true); },
          onCancel:  () => { setConfirm(null); resolve(false); },
        });
      }),
  };

  return (
    <ToastCtx.Provider value={toast}>
      {children}

      {/* Toast stack */}
      <div style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 99999,
        display: 'flex', flexDirection: 'column', gap: '10px', pointerEvents: 'none',
      }}>
        <style>{`
          @keyframes toastSlideIn {
            from { opacity: 0; transform: translateX(40px) scale(0.95); }
            to   { opacity: 1; transform: translateX(0) scale(1); }
          }
          @keyframes confirmIn {
            from { opacity: 0; transform: scale(0.90) translateY(16px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>
        {toasts.map(t => (
          <div key={t.id} style={{ pointerEvents: 'all' }}>
            <ToastItem {...t} onRemove={remove} />
          </div>
        ))}
      </div>

      {/* Confirm dialog */}
      {confirm && <ConfirmDialog {...confirm} />}
    </ToastCtx.Provider>
  );
}
