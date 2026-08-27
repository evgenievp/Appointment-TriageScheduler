import { Component } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Icon } from './ds';
import illustration from '../assets/app-error.webp';

// Единственото място, където класов компонент още е задължителен: hooks не могат
// да хващат грешки при рисуване. Хваща само тях — грешките в заявките минават
// през TanStack Query и си имат `ErrorState`, а тези в event handler-и изобщо не
// стигат дотук.

const mono = { fontFamily: 'var(--font-mono)', fontWeight: 'var(--fw-mono)' };

// Резервният изглед е нарочно самостоятелен: без PageShell, без заявки, без
// контексти. Ако е гръмнал хедърът или някой provider, изглед, който пак ги
// рисува, ще гръмне повторно — и потребителят пак ще види бяла страница.
function ErrorFallback({ error }) {
  const { t } = useTranslation();

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 'var(--space-6)',
        padding: 'var(--section-padding-y-md) var(--gutter)',
        background: 'var(--surface-page)',
      }}
    >
      <img
        src={illustration}
        alt={t('appError.imageAlt')}
        style={{
          width: '100%',
          maxWidth: 'var(--illustration-max)',
          height: 'auto',
          borderRadius: 'var(--radius)',
        }}
      />

      <div style={{ maxWidth: 'var(--measure)' }}>
        <h1>{t('appError.title')}</h1>
        <p style={{ color: 'var(--text-strong-muted)', marginTop: 'var(--space-3)' }}>
          {t('appError.lead')}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button
          onClick={() => window.location.reload()}
          iconLeft={<Icon name="rotate-cw" size="var(--icon-sm)" />}
        >
          {t('appError.reload')}
        </Button>
        {/* Пълно презареждане, а не `navigate` — рутерът може да е част от
            счупеното, а и целта е приложението да тръгне от чисто. */}
        <Button
          variant="secondary"
          onClick={() => {
            window.location.href = '/';
          }}
          iconLeft={<Icon name="house" size="var(--icon-sm)" />}
        >
          {t('appError.home')}
        </Button>
      </div>

      {/* Само в разработка: на потребителя това не помага, а може да издаде
          вътрешности. В конзолата стои и в двата режима. */}
      {import.meta.env.DEV && error?.message && (
        <pre
          style={{
            ...mono,
            fontSize: 'var(--text-body-sm)',
            color: 'var(--danger)',
            maxWidth: 'var(--measure)',
            whiteSpace: 'pre-wrap',
            textAlign: 'left',
          }}
        >
          {error.message}
        </pre>
      )}
    </main>
  );
}

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // В продукция това е единствената следа — няма overlay, който да я покаже.
    console.error('Неочаквана грешка при рисуване:', error, info.componentStack);
  }

  render() {
    if (this.state.error) return <ErrorFallback error={this.state.error} />;
    return this.props.children;
  }
}
