import { useEffect, useState } from 'react';
import Icon from './Icon';

// Пренесен от Claude Design (components/navigation/GlassHeader.jsx).
// Единственият sticky елемент в приложението. Glass е позволено само върху
// скролващо се съдържание — никога върху плътно бяло.
//
// Отклонение от дизайна: добавено е мобилно меню, каквото оригиналният компонент
// няма. Системата обаче го предвижда — `readme.md` дава рецептата за него
// („Dark overlays and mobile menus“) и токенът `--glass-dark-bg` съществува
// точно за това. Струва си да се поиска и в самата дизайн система, за да не се
// разминават двете.
//
// Отстъпите и подредбата са в `.sirma-glass-header` (ds/app.css), защото инлайн
// стил не се надвива от media query.

export default function GlassHeader({
  logo,
  links = [],
  // Три слота за действията, защото на тесен екран лентата побира само малките:
  //   right        — пълният набор, вижда се на широк екран
  //   rightCompact — това, което остава в лентата до бургера на тесен екран
  //   rightOnDark  — това, което влиза в тъмния панел (бутоните носят цветовете
  //                  си инлайн, а инлайн стил не се надвива от CSS, затова е
  //                  отделен слот, а не селектор)
  right,
  rightCompact,
  rightOnDark,
  dark,
  menuLabel,
  style,
  ...rest
}) {
  const [open, setOpen] = useState(false);

  // Escape затваря менюто — очаква се от всеки overlay.
  useEffect(() => {
    if (!open) return;
    const onKey = (event) => event.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const linkColor = (link) =>
    link.active
      ? dark
        ? 'var(--blue-400)'
        : 'var(--navy-900)'
      : dark
        ? 'var(--text-on-dark-nav)'
        : 'var(--text-muted)';

  return (
    <header
      className="sirma-glass-header"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 'var(--z-header)',
        display: 'flex',
        alignItems: 'center',
        borderBottom:
          'var(--border-width) solid ' +
          (dark ? 'var(--border-on-dark-faint)' : 'var(--border-default)'),
        background: dark ? 'var(--glass-dark-bg)' : 'var(--glass-header-bg)',
        backdropFilter: 'var(--glass-header-blur)',
        WebkitBackdropFilter: 'var(--glass-header-blur)',
        color: dark ? 'var(--text-on-dark)' : 'var(--navy-500)',
        ...style,
      }}
      {...rest}
    >
      <div
        className="sirma-glass-header__logo"
        style={{
          fontWeight: 'var(--fw-bold)',
          fontSize: 'var(--text-h3)',
          letterSpacing: 'var(--ls-heading)',
          color: dark ? 'var(--text-on-dark)' : 'var(--navy-900)',
        }}
      >
        {logo}
      </div>

      <nav className="sirma-glass-header__nav" style={{ alignItems: 'center' }}>
        {links.map((link) => (
          <span
            key={link.label}
            onClick={link.onClick}
            style={{
              fontSize: 'var(--text-body-sm)',
              fontWeight: link.active ? 'var(--fw-semibold)' : 'var(--fw-medium)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              color: linkColor(link),
            }}
          >
            {link.label}
          </span>
        ))}
      </nav>

      <div
        className="sirma-glass-header__actions"
        style={{ gap: 'var(--space-3)', alignItems: 'center' }}
      >
        {right}
      </div>

      <div
        className="sirma-glass-header__actions-compact"
        style={{ gap: 'var(--space-1)', alignItems: 'center' }}
      >
        {rightCompact}
      </div>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        {links.length > 0 && (
          <button
            type="button"
            className="sirma-glass-header__burger"
            aria-label={menuLabel}
            aria-expanded={open}
            onClick={() => setOpen((current) => !current)}
            style={{
              background: 'transparent',
              border: 'var(--border-width) solid transparent',
              borderRadius: 'var(--radius)',
              padding: 'var(--space-1)',
              cursor: 'pointer',
              color: 'inherit',
              alignItems: 'center',
            }}
          >
            <Icon name={open ? 'x' : 'menu'} size="var(--icon-lg)" />
          </button>
        )}
      </div>

      {open && (
        <div
          className="sirma-glass-header__panel"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          {links.map((link) => (
            <button
              key={link.label}
              type="button"
              onClick={link.onClick}
              style={{
                background: 'transparent',
                border: 'none',
                textAlign: 'left',
                padding: 'var(--space-3) 0',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-h4)',
                fontWeight: link.active ? 'var(--fw-semibold)' : 'var(--fw-medium)',
                color: link.active ? 'var(--blue-400)' : 'var(--text-on-dark)',
              }}
            >
              {link.label}
            </button>
          ))}
          {rightOnDark && (
            <div className="sirma-glass-header__panel-actions">{rightOnDark}</div>
          )}
        </div>
      )}
    </header>
  );
}
