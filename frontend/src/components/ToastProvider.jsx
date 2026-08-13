import { useCallback, useRef, useState } from 'react';
import { Toast } from './ds';
import { ToastContext } from '../lib/toastContext';

const VISIBLE_MS = 6000;

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (toast) => {
      const id = ++nextId.current;
      setToasts((current) => [...current, { ...toast, id }]);
      setTimeout(() => dismiss(id), toast.duration ?? VISIBLE_MS);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div
        aria-live="polite"
        style={{
          position: 'fixed',
          right: 'var(--space-6)',
          bottom: 'var(--space-6)',
          zIndex: 'var(--z-toast)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
        }}
      >
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            tone={toast.tone}
            title={toast.title}
            message={toast.message}
            onClose={() => dismiss(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
