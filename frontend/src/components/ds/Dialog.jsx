import { useEffect, useId, useRef } from 'react';

// Пренесен от Claude Design (components/feedback/Dialog.jsx).
// Единственото място освен glass панелите, където сянка е позволена.
//
// Добавено спрямо оригинала, който е само рисунка: Escape затваря, скролът на
// страницата се заключва, фокусът влиза в диалога и се връща откъдето е дошъл,
// плюс role/aria. Пълен focus trap няма — Tab може да излезе от диалога.

export default function Dialog({
  open,
  title,
  description,
  footer,
  onClose,
  children,
  width = 'var(--measure-narrow)',
}) {
  const panel = useRef(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    const returnTo = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.current?.focus();

    const onKey = (event) => event.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      returnTo?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 'var(--z-dialog)',
        background: 'var(--glass-dark-bg)',
        backdropFilter: 'var(--glass-dark-blur)',
        WebkitBackdropFilter: 'var(--glass-dark-blur)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--gutter)',
      }}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        style={{
          background: 'var(--white)',
          borderRadius: 'var(--radius)',
          width,
          maxWidth: '100%',
          padding: 'var(--card-padding)',
          boxShadow: 'var(--shadow-glass)',
          outline: 'none',
        }}
      >
        {title && (
          <h3
            id={titleId}
            style={{
              fontSize: 'var(--text-h3)',
              fontWeight: 'var(--fw-bold)',
              letterSpacing: 'var(--ls-heading)',
              color: 'var(--navy-900)',
              margin: 0,
            }}
          >
            {title}
          </h3>
        )}
        {description && (
          <p
            style={{
              marginTop: 'var(--space-2)',
              color: 'var(--text-muted)',
              fontSize: 'var(--text-body-sm)',
            }}
          >
            {description}
          </p>
        )}
        {children && <div style={{ marginTop: 'var(--space-4)' }}>{children}</div>}
        {footer && (
          <div
            style={{
              marginTop: 'var(--space-6)',
              display: 'flex',
              gap: 'var(--space-2)',
              justifyContent: 'flex-end',
              flexWrap: 'wrap',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
