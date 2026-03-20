import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastCtx = createContext(null);

export function useToast() {
  return useContext(ToastCtx);
}

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
      display: 'flex', alignItems: 'flex-start', gap: '14px',
      background: '#fff', border: `1px solid ${c.border}`,
      borderLeft: `5px solid ${c.bar}`,
      borderRadius: '12px', padding: '18px 20px',
      boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
      width: '100%',
      animation: 'toastSlideIn 0.28s cubic-bezier(0.34,1.56,0.64,1)',
      fontFamily: 'var(--font, "Outfit", sans-serif)',
    }}>
      {}
      <span style={{
        width: 36, height: 36, borderRadius: '50%',
        background: c.bg, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '1rem',
        color: c.icon, fontWeight: 800, flexShrink: 0, marginTop: 1,
      }}>{icons[type]}</span>

      {}
      <div style={{ flex: 1 }}>
        {title && (
          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#111827', marginBottom: message ? 5 : 0 }}>
            {title}
          </div>
        )}
        {message && (
          <div style={{ fontSize: '0.84rem', color: '#6b7280', lineHeight: 1.5 }}>{message}</div>
        )}
      </div>

      {}
      <button onClick={() => onRemove(id)}
        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', color: '#ef4444', fontSize: '0.9rem', padding: '2px 7px', lineHeight: 1, marginTop: 1, flexShrink: 0, borderRadius: '6px', fontWeight: 700, transition: 'all 0.15s' }}
        onMouseEnter={e => { e.target.style.background='rgba(239,68,68,0.22)'; }}
        onMouseLeave={e => { e.target.style.background='rgba(239,68,68,0.1)'; }}
      >×</button>
    </div>
  );
}

function ConfirmDialog({ title, message, onConfirm, onCancel, confirmLabel = 'Confirm', danger = false }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99998,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff', border: '1px solid #e5e7eb',
        borderRadius: '16px', padding: '28px 32px',
        minWidth: '360px', maxWidth: '460px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
        animation: 'confirmIn 0.22s cubic-bezier(0.34,1.56,0.64,1)',
        fontFamily: 'var(--font, "Outfit", sans-serif)',
      }}>
        {}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
          <span style={{
            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
            background: danger ? '#fef2f2' : '#eff6ff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem',
          }}>
            {danger ? '⚠' : '?'}
          </span>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: '#111827' }}>{title}</span>
        </div>

        {}
        {message && (
          <p style={{ fontSize: '0.85rem', color: '#6b7280', lineHeight: 1.6, margin: '0 0 22px 48px' }}>
            {message}
          </p>
        )}

        {}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: message ? 0 : 20 }}>
          <button onClick={onCancel} style={{
            padding: '9px 20px', borderRadius: '8px', border: '1.5px solid #334155',
            background: 'transparent', color: '#6b7280', cursor: 'pointer',
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

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirm, setConfirm] = useState(null);
  const idRef = useRef(0);

  const remove = useCallback((id) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  const add = useCallback((type, titleOrMsg, message, duration = 3500) => {
    const id = ++idRef.current;

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

      {}
      <div style={{
        position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)',
        zIndex: 99999, display: 'flex', flexDirection: 'column',
        gap: '12px', pointerEvents: 'none', width: '480px', maxWidth: 'calc(100vw - 32px)',
      }}>
        <style>{`
          @keyframes toastSlideIn {
            from { opacity: 0; transform: translateY(-20px) scale(0.96); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
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

      {}
      {confirm && <ConfirmDialog {...confirm} />}
    </ToastCtx.Provider>
  );
}
