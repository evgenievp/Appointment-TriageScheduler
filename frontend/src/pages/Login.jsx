import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageShell from '../components/PageShell';
import LoginForm from '../components/auth/LoginForm';
import { Button, Card } from '../components/ds';
import { useToast } from '../lib/toastContext';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const showToast = useToast();

  // Guards send patients here with ?from=…, so they land back where they were.
  // Only in-app paths are accepted; an absolute URL would be an open redirect.
  const from = params.get('from');
  const target = from?.startsWith('/') && !from.startsWith('//') ? from : '/doctors';

  const done = () => {
    showToast({
      tone: 'success',
      title: t('auth.login.successTitle'),
      message: t('auth.login.successMessage'),
    });
    navigate(target, { replace: true });
  };

  return (
    <PageShell>
      <div style={{ maxWidth: 'var(--measure-narrow)', margin: '0 auto' }}>
        <h1>{t('auth.login.title')}</h1>
        <p
          style={{
            color: 'var(--text-muted)',
            marginTop: 'var(--space-3)',
            marginBottom: 'var(--space-8)',
          }}
        >
          {t('auth.login.lead')}
        </p>

        <LoginForm onDone={done} />

        <Card
          tone="sunken"
          padding="var(--card-padding-sm)"
          style={{
            marginTop: 'var(--space-4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-4)',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{ fontSize: 'var(--text-body-sm)', color: 'var(--text-strong-muted)' }}
          >
            {t('auth.login.noAccount')}
          </span>
          <Button size="sm" variant="secondary" onClick={() => navigate('/register')}>
            {t('auth.login.register')}
          </Button>
        </Card>
      </div>
    </PageShell>
  );
}
