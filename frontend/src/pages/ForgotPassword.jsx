import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import PageShell from '../components/PageShell';
import { Button, Card, EmptyState, ErrorState, Icon, Input } from '../components/ds';
import { forgotPassword } from '../api/auth';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// The success screen is the same whether or not the address has an account.
// The server answers 200 either way, and so does this page — the only person
// who learns anything is the one holding that mailbox.
export default function ForgotPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  // The login form passes along whatever was typed, so nobody types it twice.
  const [email, setEmail] = useState(() => params.get('email') ?? '');
  const [submitted, setSubmitted] = useState(false);

  const error = !email.trim()
    ? t('auth.errors.required')
    : !EMAIL.test(email.trim())
      ? t('auth.errors.emailInvalid')
      : undefined;

  const mutation = useMutation({ mutationFn: () => forgotPassword(email.trim()) });

  const submit = (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (!error) mutation.mutate();
  };

  return (
    <PageShell>
      <div style={{ maxWidth: 'var(--measure-narrow)', margin: '0 auto' }}>
        <h1>{t('auth.forgot.title')}</h1>
        <p
          style={{
            color: 'var(--text-muted)',
            marginTop: 'var(--space-3)',
            marginBottom: 'var(--space-8)',
          }}
        >
          {t('auth.forgot.lead')}
        </p>

        {mutation.isSuccess ? (
          <EmptyState
            icon={<Icon name="shield-check" size="var(--icon-md)" />}
            title={t('auth.forgot.sentTitle')}
            description={t('auth.forgot.sentText')}
            action={<Button onClick={() => navigate('/login')}>{t('auth.forgot.backToLogin')}</Button>}
          />
        ) : (
          <form onSubmit={submit} noValidate>
            {mutation.isError && (
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <ErrorState
                  compact
                  align="left"
                  surface="card"
                  icon={<Icon name="triangle-alert" size="var(--icon-md)" />}
                  title={t('auth.forgot.errorTitle')}
                  description={t('auth.forgot.errorText')}
                />
              </div>
            )}

            <Card>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <Input
                  label={t('auth.forgot.email')}
                  type="email"
                  placeholder={t('auth.forgot.emailPlaceholder')}
                  autoComplete="username"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  error={submitted ? error : undefined}
                />
                <Button type="submit" fullWidth disabled={mutation.isPending}>
                  {t(mutation.isPending ? 'auth.forgot.submitting' : 'auth.forgot.submit')}
                </Button>
              </div>
            </Card>

            <Button
              type="button"
              variant="ghost"
              style={{ marginTop: 'var(--space-4)' }}
              onClick={() => navigate('/login')}
            >
              ← {t('auth.forgot.backToLogin')}
            </Button>
          </form>
        )}
      </div>
    </PageShell>
  );
}
