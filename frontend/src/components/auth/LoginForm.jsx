import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { Button, Card, Checkbox, ErrorState, Icon, IconButton, Input } from '../ds';
import { login } from '../../api/auth';
import { useAuth } from '../../lib/authContext';

// Kept apart from the page so the booking flow can show it in a Dialog instead
// of sending the patient away from the slot they just picked.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginForm({ onDone }) {
  const { t } = useTranslation();
  const { signIn } = useAuth();

  const [values, setValues] = useState({ email: '', password: '' });
  const [remember, setRemember] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const set = (field) => (event) =>
    setValues((current) => ({ ...current, [field]: event.target.value }));

  const errors = {
    email: !values.email.trim()
      ? t('auth.errors.required')
      : !EMAIL.test(values.email.trim())
        ? t('auth.errors.emailInvalid')
        : undefined,
    password: !values.password ? t('auth.errors.required') : undefined,
  };
  const valid = !Object.values(errors).some(Boolean);

  const mutation = useMutation({
    mutationFn: () =>
      login({ email: values.email.trim(), password: values.password }),
    onSuccess: ({ token }) => {
      signIn(token, remember);
      onDone?.();
    },
    onError: () => setValues((current) => ({ ...current, password: '' })),
  });

  const submit = (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (valid) mutation.mutate();
  };

  const errorOf = (field) => (submitted ? errors[field] : undefined);
  // 401 is a wrong email or password; anything else is the server misbehaving.
  const rejected = mutation.error?.status === 401;

  return (
    <form onSubmit={submit} noValidate>
      {mutation.isError && (
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <ErrorState
            compact
            align="left"
            surface="card"
            icon={<Icon name="triangle-alert" size="var(--icon-md)" />}
            title={t(rejected ? 'auth.login.failedTitle' : 'auth.login.errorTitle')}
            description={t(
              rejected ? 'auth.login.failedMessage' : 'auth.login.errorMessage',
            )}
          />
        </div>
      )}

      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input
            label={t('auth.login.email')}
            type="email"
            placeholder={t('auth.login.emailPlaceholder')}
            autoComplete="username"
            value={values.email}
            onChange={set('email')}
            error={errorOf('email')}
          />
          <Input
            label={t('auth.login.password')}
            type={showPassword ? 'text' : 'password'}
            placeholder={t('auth.login.passwordPlaceholder')}
            autoComplete="current-password"
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

          <Checkbox
            checked={remember}
            onChange={() => setRemember((value) => !value)}
            label={t('auth.login.remember')}
            description={t('auth.login.rememberDescription')}
          />

          <Button type="submit" fullWidth disabled={mutation.isPending}>
            {t(mutation.isPending ? 'auth.login.submitting' : 'auth.login.submit')}
          </Button>
        </div>
      </Card>
    </form>
  );
}
