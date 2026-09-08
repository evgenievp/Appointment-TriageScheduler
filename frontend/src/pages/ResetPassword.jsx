import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import PageShell from '../components/PageShell';
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  Icon,
  IconButton,
  Input,
} from '../components/ds';
import { resetPassword } from '../api/auth';
import { useToast } from '../lib/toastContext';

const MIN_PASSWORD = 8;
const mono = { fontFamily: 'var(--font-mono)', fontWeight: 'var(--fw-mono)' };

// Landing page of the link in the mail: /reset-password?token=…&email=…
// Both come from the URL and are never typed — a missing one means the link
// was mangled, and that gets the same screen as an expired token.
export default function ResetPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const showToast = useToast();
  const [params] = useSearchParams();

  const token = params.get('token');
  const email = params.get('email');

  const [values, setValues] = useState({ password: '', repeat: '' });
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const set = (field) => (event) =>
    setValues((current) => ({ ...current, [field]: event.target.value }));

  const errors = {
    password: !values.password
      ? t('auth.errors.required')
      : values.password.length < MIN_PASSWORD
        ? t('auth.errors.passwordShort')
        : undefined,
    repeat: values.repeat !== values.password ? t('auth.reset.mismatch') : undefined,
  };
  const valid = !Object.values(errors).some(Boolean);

  const mutation = useMutation({
    mutationFn: () => resetPassword({ email, token, newPassword: values.password }),
    onSuccess: () => {
      showToast({
        tone: 'success',
        title: t('auth.reset.doneTitle'),
        message: t('auth.reset.doneMessage'),
      });
      navigate('/login', { replace: true });
    },
  });

  const submit = (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (valid) mutation.mutate();
  };

  const errorOf = (field) => (submitted ? errors[field] : undefined);

  // 400 is the server's word for a wrong or expired token; anything else is a
  // hiccup worth retrying with the same link.
  const invalid = !token || !email || mutation.error?.status === 400;

  return (
    <PageShell>
      <div style={{ maxWidth: 'var(--measure-narrow)', margin: '0 auto' }}>
        <h1>{t('auth.reset.title')}</h1>

        {invalid ? (
          <EmptyState
            style={{ marginTop: 'var(--space-8)' }}
            icon={<Icon name="triangle-alert" size="var(--icon-md)" />}
            title={t('auth.reset.invalidTitle')}
            description={t('auth.reset.invalidText')}
            action={
              <Button onClick={() => navigate('/forgot-password')}>
                {t('auth.reset.requestNew')}
              </Button>
            }
          />
        ) : (
          <>
            <p
              style={{
                color: 'var(--text-muted)',
                marginTop: 'var(--space-3)',
                marginBottom: 'var(--space-8)',
              }}
            >
              <Trans
                i18nKey="auth.reset.lead"
                values={{ email }}
                components={{ mono: <span style={mono} /> }}
              />
            </p>

            <form onSubmit={submit} noValidate>
              {mutation.isError && (
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <ErrorState
                    compact
                    align="left"
                    surface="card"
                    icon={<Icon name="triangle-alert" size="var(--icon-md)" />}
                    title={t('auth.reset.errorTitle')}
                    description={t('auth.reset.errorText')}
                  />
                </div>
              )}

              <Card>
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
                >
                  <Input
                    label={t('auth.reset.password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('auth.reset.passwordPlaceholder')}
                    autoComplete="new-password"
                    value={values.password}
                    onChange={set('password')}
                    error={errorOf('password')}
                    suffix={
                      <IconButton
                        type="button"
                        variant="ghost"
                        size="var(--icon-btn-size-sm)"
                        label={t(showPassword ? 'auth.hidePassword' : 'auth.showPassword')}
                        onClick={() => setShowPassword((shown) => !shown)}
                      >
                        <Icon name={showPassword ? 'eye-off' : 'eye'} size="var(--icon-sm)" />
                      </IconButton>
                    }
                  />
                  <Input
                    label={t('auth.reset.repeat')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('auth.reset.repeatPlaceholder')}
                    autoComplete="new-password"
                    value={values.repeat}
                    onChange={set('repeat')}
                    error={errorOf('repeat')}
                  />
                  <Button type="submit" fullWidth disabled={mutation.isPending}>
                    {t(mutation.isPending ? 'auth.reset.submitting' : 'auth.reset.submit')}
                  </Button>
                </div>
              </Card>
            </form>
          </>
        )}
      </div>
    </PageShell>
  );
}
