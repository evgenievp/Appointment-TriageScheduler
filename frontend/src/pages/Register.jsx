import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageShell from '../components/PageShell';
import RegisterForm from '../components/auth/RegisterForm';
import { Button, Card } from '../components/ds';
import { useToast } from '../lib/toastContext';

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const showToast = useToast();

  const done = () => {
    showToast({
      tone: 'success',
      title: t('auth.register.successTitle'),
      message: t('auth.register.successMessage'),
    });
    navigate('/doctors');
  };

  return (
    <PageShell>
      <div style={{ maxWidth: 'var(--measure)', margin: '0 auto' }}>
        <h1>{t('auth.register.title')}</h1>
        <p
          style={{
            color: 'var(--text-muted)',
            marginTop: 'var(--space-3)',
            marginBottom: 'var(--space-8)',
          }}
        >
          {t('auth.register.lead')}
        </p>

        <RegisterForm onDone={done} />

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
            style={{
              fontSize: 'var(--text-body-sm)',
              color: 'var(--text-strong-muted)',
            }}
          >
            {t('auth.register.haveAccount')}
          </span>
          <Button size="sm" variant="secondary" onClick={() => navigate('/login')}>
            {t('auth.register.signIn')}
          </Button>
        </Card>
      </div>
    </PageShell>
  );
}
