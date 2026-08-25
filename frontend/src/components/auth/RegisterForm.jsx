import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { Button, Card, Checkbox, ErrorState, Icon, IconButton, Input } from '../ds';
import { login, register } from '../../api/auth';
import { useAuth } from '../../lib/authContext';

// The form lives apart from the page so it can also be dropped into a Dialog
// during the booking flow, where sending the patient to another screen would
// lose the slot they picked.
//
// The backend accepts only { email, password, name, phone }; the design asks for
// a lot more (national ID, city, insurer). Building those fields would mean
// collecting data nothing consumes.

const MIN_PASSWORD = 8;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterForm({ onDone }) {
  const { t } = useTranslation();
  const { signIn } = useAuth();

  const [values, setValues] = useState({ name: '', email: '', phone: '', password: '' });
  const [consents, setConsents] = useState({ terms: false, gdpr: false });
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const set = (field) => (event) =>
    setValues((current) => ({ ...current, [field]: event.target.value }));

  const errors = {
    name: !values.name.trim() ? t('auth.errors.required') : undefined,
    email: !values.email.trim()
      ? t('auth.errors.required')
      : !EMAIL.test(values.email.trim())
        ? t('auth.errors.emailInvalid')
        : undefined,
    phone: !values.phone.trim() ? t('auth.errors.required') : undefined,
    password: !values.password
      ? t('auth.errors.required')
      : values.password.length < MIN_PASSWORD
        ? t('auth.errors.passwordShort')
        : undefined,
  };
  const consentsGiven = consents.terms && consents.gdpr;
  const valid = !Object.values(errors).some(Boolean) && consentsGiven;

  const mutation = useMutation({
    // Registration returns the user, not a token, so sign in right after to
    // spare the patient typing the same credentials twice.
    mutationFn: async () => {
      await register({ ...values, name: values.name.trim(), email: values.email.trim() });
      const { token } = await login({
        email: values.email.trim(),
        password: values.password,
      });
      return token;
    },
    onSuccess: (token) => {
      signIn(token);
      onDone?.();
    },
  });

  const submit = (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (valid) mutation.mutate();
  };

  const errorOf = (field) => (submitted ? errors[field] : undefined);
  const emailTaken = mutation.error?.status === 409;

  return (
    <form onSubmit={submit} noValidate>
      {mutation.isError && (
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <ErrorState
            compact
            align="left"
            surface="card"
            icon={<Icon name="triangle-alert" size="var(--icon-md)" />}
            title={t(
              emailTaken
                ? 'auth.register.emailTakenTitle'
                : 'auth.register.failedTitle',
            )}
            description={t(
              emailTaken
                ? 'auth.register.emailTakenMessage'
                : 'auth.register.failedMessage',
            )}
          />
        </div>
      )}

      <Card>
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
        >
          <Input
            label={t('auth.register.name')}
            placeholder={t('auth.register.namePlaceholder')}
            autoComplete="name"
            value={values.name}
            onChange={set('name')}
            error={errorOf('name')}
          />
          <Input
            label={t('auth.register.email')}
            type="email"
            placeholder={t('auth.register.emailPlaceholder')}
            autoComplete="username"
            value={values.email}
            onChange={set('email')}
            error={errorOf('email')}
          />
          <Input
            label={t('auth.register.phone')}
            mono
            type="tel"
            placeholder={t('auth.register.phonePlaceholder')}
            autoComplete="tel"
            value={values.phone}
            onChange={set('phone')}
            error={errorOf('phone')}
            hint={t('auth.register.phoneHint')}
          />
          <Input
            label={t('auth.register.password')}
            type={showPassword ? 'text' : 'password'}
            placeholder={t('auth.register.passwordPlaceholder')}
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

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
              paddingTop: 'var(--space-2)',
            }}
          >
            <Checkbox
              checked={consents.terms}
              onChange={() =>
                setConsents((c) => ({ ...c, terms: !c.terms }))
              }
              label={t('auth.register.terms')}
              description={t('auth.register.termsDescription')}
            />
            <Checkbox
              checked={consents.gdpr}
              onChange={() => setConsents((c) => ({ ...c, gdpr: !c.gdpr }))}
              label={t('auth.register.gdpr')}
              description={t('auth.register.gdprDescription')}
            />
            {submitted && !consentsGiven && (
              <span
                style={{ fontSize: 'var(--text-body-sm)', color: 'var(--danger)' }}
              >
                {t('auth.register.consentsRequired')}
              </span>
            )}
          </div>

          <Button type="submit" fullWidth disabled={mutation.isPending}>
            {t(mutation.isPending ? 'auth.register.submitting' : 'auth.register.submit')}
          </Button>
        </div>
      </Card>
    </form>
  );
}
