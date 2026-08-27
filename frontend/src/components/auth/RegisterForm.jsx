import { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import {
  Button,
  Card,
  Checkbox,
  ErrorState,
  Icon,
  IconButton,
  Input,
  Select,
} from '../ds';
import { login, register } from '../../api/auth';
import { useAuth } from '../../lib/authContext';
import { countries, DEFAULT_COUNTRY, isValidPhone, toE164 } from '../../lib/phone';

// The form lives apart from the page so it can also be dropped into a Dialog
// during the booking flow, where sending the patient to another screen would
// lose the slot they picked.
//
// The backend accepts only { email, password, name, phone }; the design asks for
// a lot more (national ID, city, insurer). Building those fields would mean
// collecting data nothing consumes.

const MIN_PASSWORD = 8;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const mono = { fontFamily: 'var(--font-mono)', fontWeight: 'var(--fw-mono)' };

export default function RegisterForm({ onDone }) {
  const { t, i18n } = useTranslation();
  const { signIn } = useAuth();

  const [values, setValues] = useState({ name: '', email: '', phone: '', password: '' });
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [consents, setConsents] = useState({ terms: false, gdpr: false });
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const set = (field) => (event) =>
    setValues((current) => ({ ...current, [field]: event.target.value }));

  const countryList = useMemo(() => countries(i18n.resolvedLanguage), [i18n.resolvedLanguage]);

  // Показваме какво ще стигне до сървъра. Регистратурата после ще търси този човек
  // по същия низ, така че си струва да го е видял поне веднъж.
  const normalized = isValidPhone(values.phone, country)
    ? toE164(values.phone, country)
    : null;

  const errors = {
    name: !values.name.trim() ? t('auth.errors.required') : undefined,
    email: !values.email.trim()
      ? t('auth.errors.required')
      : !EMAIL.test(values.email.trim())
        ? t('auth.errors.emailInvalid')
        : undefined,
    phone: !values.phone.trim()
      ? t('auth.errors.required')
      : !normalized
        ? t('auth.errors.phoneInvalid')
        : undefined,
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
      await register({
        ...values,
        name: values.name.trim(),
        email: values.email.trim(),
        // Бекендът не нормализира при регистрация, затова номерът тръгва оттук
        // готов — в базата влиза същият низ, по който после ще се търси.
        phone: normalized,
      });
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
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--space-3)',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flex: '1 1 11rem', minWidth: 0 }}>
              <Select
                label={t('auth.register.country')}
                value={country}
                onChange={(event) => setCountry(event.target.value)}
              >
                {countryList.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.name} (+{item.dial})
                  </option>
                ))}
              </Select>
            </div>
            <div style={{ flex: '2 1 13rem', minWidth: 0 }}>
              <Input
                label={t('auth.register.phone')}
                mono
                type="tel"
                placeholder={t('auth.register.phonePlaceholder')}
                autoComplete="tel"
                value={values.phone}
                onChange={set('phone')}
                error={errorOf('phone')}
                hint={
                  normalized ? (
                    <Trans
                      i18nKey="auth.register.phoneNormalized"
                      values={{ phone: normalized }}
                      components={{ mono: <span style={mono} /> }}
                    />
                  ) : (
                    t('auth.register.phoneHint')
                  )
                }
              />
            </div>
          </div>
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
