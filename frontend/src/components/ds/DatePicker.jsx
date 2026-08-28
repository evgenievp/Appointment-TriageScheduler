import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from './Icon';
import { addDays, isSameDay, startOfWeek, toDateInput } from '../../lib/dates';
import { useNow } from '../../lib/useNow';

// Собствен избор на дата вместо `<input type="date">`.
//
// Нативното поле се рисува на езика на БРАУЗЪРА, не на приложението — английски
// Chrome дава `mm/dd/yyyy` насред български екран и `lang` не му влияе. Същата
// причина, поради която часовете са `Select`, а не `type="time"`.
//
// Без библиотека: седмичният грид в проекта също е ръчен, а всяка библиотека
// щеше да дойде със свои стилове, които така или иначе се пренаписват с токени.
//
// Стойността е "2026-08-13" — същият формат като на нативното поле, за да е
// подмяна едно към едно. `onChange` получава низа, не събитие.

const WEEK = 7;
const ROWS = 6; // винаги шест реда, за да не подскача панелът между месеците

const cell = {
  width: 'var(--datepicker-cell)',
  height: 'var(--datepicker-cell)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'var(--font-mono)',
  fontWeight: 'var(--fw-mono)',
  fontSize: 'var(--text-body-sm)',
  borderRadius: 'var(--radius)',
  border: 'var(--border-width) solid transparent',
  background: 'transparent',
  cursor: 'pointer',
};

function Month({ value, onPick, onClose, locale, align }) {
  const now = useNow();
  const today = new Date(now);
  const selected = value ? new Date(`${value}T00:00:00`) : null;

  // Панелът се монтира наново при всяко отваряне, затова началният месец се
  // взима тук — без ефект, който да го „поправя“ след първото рисуване.
  const [cursor, setCursor] = useState(() => {
    const base = selected ?? today;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const grid = useRef(null);
  const [focused, setFocused] = useState(() => selected ?? today);

  useEffect(() => {
    grid.current?.querySelector('[data-focused="true"]')?.focus();
  });

  const monthLabel = new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
  }).format(cursor);

  const first = startOfWeek(cursor);
  const days = Array.from({ length: WEEK * ROWS }, (_, i) => addDays(first, i));
  const weekdays = days.slice(0, WEEK).map((day) =>
    new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(day),
  );

  const move = (days) => {
    const next = addDays(focused, days);
    setFocused(next);
    if (next.getMonth() !== cursor.getMonth() || next.getFullYear() !== cursor.getFullYear()) {
      setCursor(new Date(next.getFullYear(), next.getMonth(), 1));
    }
  };

  const onKeyDown = (event) => {
    const keys = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -WEEK, ArrowDown: WEEK };
    if (keys[event.key] !== undefined) {
      event.preventDefault();
      move(keys[event.key]);
    } else if (event.key === 'PageUp' || event.key === 'PageDown') {
      event.preventDefault();
      const next = new Date(focused);
      next.setMonth(next.getMonth() + (event.key === 'PageUp' ? -1 : 1));
      setFocused(next);
      setCursor(new Date(next.getFullYear(), next.getMonth(), 1));
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      const week = startOfWeek(focused);
      move(0);
      setFocused(event.key === 'Home' ? week : addDays(week, WEEK - 1));
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onPick(toDateInput(focused));
    } else if (event.key === 'Escape') {
      onClose();
    }
  };

  const step = (months) => {
    const next = new Date(cursor);
    next.setMonth(next.getMonth() + months);
    setCursor(next);
  };

  return (
    <div
      className="sirma-datepicker__panel"
      style={align === 'right' ? { left: 'auto', right: 0 } : null}
    >
      <div className="sirma-datepicker__head">
        <button type="button" className="sirma-datepicker__nav" onClick={() => step(-1)}>
          <Icon name="chevron-left" size="var(--icon-sm)" />
        </button>
        <span
          style={{
            fontWeight: 'var(--fw-semibold)',
            fontSize: 'var(--text-body-md)',
            color: 'var(--navy-900)',
          }}
        >
          {monthLabel}
        </span>
        <button type="button" className="sirma-datepicker__nav" onClick={() => step(1)}>
          <Icon name="chevron-right" size="var(--icon-sm)" />
        </button>
      </div>

      <div className="sirma-datepicker__weekdays">
        {weekdays.map((name, i) => (
          <span key={i}>{name}</span>
        ))}
      </div>

      <div ref={grid} role="grid" className="sirma-datepicker__grid" onKeyDown={onKeyDown}>
        {days.map((day) => {
          const outside = day.getMonth() !== cursor.getMonth();
          const isSelected = selected && isSameDay(day, selected);
          const isFocused = isSameDay(day, focused);

          return (
            <button
              key={toDateInput(day)}
              type="button"
              role="gridcell"
              aria-selected={Boolean(isSelected)}
              data-focused={isFocused}
              tabIndex={isFocused ? 0 : -1}
              onClick={() => onPick(toDateInput(day))}
              style={{
                ...cell,
                color: outside ? 'var(--text-subtle)' : 'var(--navy-900)',
                ...(isSameDay(day, today)
                  ? { borderColor: 'var(--border-strong)' }
                  : null),
                ...(isSelected
                  ? {
                      background: 'var(--action-bg)',
                      color: 'var(--action-text)',
                      fontWeight: 'var(--fw-bold)',
                    }
                  : null),
              }}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function DatePicker({ label, hint, error, value, onChange, align = 'left' }) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const locale = i18n.resolvedLanguage;

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (!root.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  // „29.08.2026 г.“ / „Aug 29, 2026“ — локализирано и късо. Денят с думи вече
  // стои в заглавието на екрана, тук е нужна само еднозначната стойност.
  const shown = value
    ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(
        new Date(`${value}T00:00:00`),
      )
    : t('common.pickDate');

  return (
    <div className="sirma-datepicker" ref={root}>
      {label && <span className="sirma-datepicker__label">{label}</span>}

      <button
        type="button"
        className="sirma-datepicker__trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((was) => !was)}
        style={{ borderColor: error ? 'var(--danger)' : undefined }}
      >
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'var(--fw-mono)' }}>
          {shown}
        </span>
        <Icon name="calendar" size="var(--icon-sm)" />
      </button>

      {open && (
        <Month
          align={align}
          value={value}
          locale={locale}
          onClose={() => setOpen(false)}
          onPick={(picked) => {
            onChange(picked);
            setOpen(false);
          }}
        />
      )}

      {(hint || error) && (
        <span className="sirma-datepicker__hint" style={{ color: error ? 'var(--danger)' : undefined }}>
          {error || hint}
        </span>
      )}
    </div>
  );
}
