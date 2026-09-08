import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from '@tanstack/react-query';
import PageShell from '../components/PageShell';
import { Button, Card, ErrorState, Icon, IconButton, Input, Skeleton } from '../components/ds';
import { changePassword } from '../api/auth';
import { getMe } from '../api/patients';
import { useAuth } from '../lib/authContext';
import { useToast } from '../lib/toastContext';

const MIN_PASSWORD = 8;
const mono = { fontFamily: 'var(--font-mono)', fontWeight: 'var(--fw-mono)' };

const EMPTY = { oldPassword: '', password: '', repeat: '' };

export default function Settings() {
  const { t } = useTranslation();
  const showToast = useToast();
  const { user } = useAuth();

  // `/patients/me` is for patients only; everyone else still has the email
  // from the token, which is all the password form needs.
  const isPatient = user?.role === 'PATIENT';
  const profile = useQuery({ queryKey: ['patients', 'me'], queryFn: getMe, enabled: isPatient });

  const [values, setValues] = useState(EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const [show, setShow] = useState(false);

  const set = (field) => (event) =>
    setValues((current) => ({ ...current, [field]: event.target.value }));

  const errors = {
    oldPassword: !values.oldPassword ? t('auth.errors.required') : undefined,
    password: !values.password
      ? t('auth.errors.required')
      : values.password.length < MIN_PASSWORD
        ? t('auth.errors.passwordShort')
        : values.password === values.oldPassword
          ? t('pages.settings.password.sameAsOld')
          : undefined,
    repeat: values.repeat !== values.password ? t('pages.settings.password.mismatch') : undefined,
  };
  const valid = !Object.values(errors).some(Boolean);
  const errorOf = (field) => (submitted ? errors[field] : undefined);

  const mutation = useMutation({
    mutationFn: () =>
      changePassword({
        oldPassword: values.oldPassword,
        password: values.password,
        repeatPassword: values.repeat,
        email: user.email,
      }),
    onSuccess: () => {
      setValues(EMPTY);
      setSubmitted(false);
      showToast({
        tone: 'success',
        title: t('pages.settings.password.doneTitle'),
        message: t('pages.settings.password.doneMessage'),
      });
    },
    onError: (error) => {
      // The two new ones are checked here before sending, so a 409 can only
      // mean the current password was wrong.
      const wrongOld = error?.status === 409;
      setValues((current) => ({ ...current, oldPassword: '' }));
      showToast({
        tone: 'danger',
        title: t(
          wrongOld ? 'pages.settings.password.wrongOldTitle' : 'pages.settings.password.failedTitle',
        ),
        message: t(
          wrongOld
            ? 'pages.settings.password.wrongOldMessage'
            : 'pages.settings.password.failedMessage',
        ),
      });
    },
  });

  const submit = (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (valid) mutation.mutate();
  };

  const eye = (
    <IconButton
      type="button"
      variant="ghost"
      size="var(--icon-btn-size-sm)"
      label={t(show ? 'auth.hidePassword' : 'auth.showPassword')}
      onClick={() => setShow((shown) => !shown)}
    >
      <Icon name={show ? 'eye-off' : 'eye'} size="var(--icon-sm)" />
    </IconButton>
  );

  const rows = [
    ['name', profile.data?.name],
    ['email', profile.data?.email ?? user?.email],
    ['phone', profile.data?.phone],
  ].filter(([, value]) => value);

  return (
    <PageShell active="profile">
      <div style={{ maxWidth: 'var(--measure-narrow)', margin: '0 auto' }}>
        <h1>{t('pages.settings.title')}</h1>
        <p
          style={{
            color: 'var(--text-muted)',
            marginTop: 'var(--space-3)',
            marginBottom: 'var(--space-8)',
          }}
        >
          {t('pages.settings.lead')}
        </p>

        {profile.isPending && isPatient ? (
          <Skeleton variant="text" rows={3} label={t('common.loading')} />
        ) : profile.isError ? (
          <ErrorState
            compact
            align="left"
            surface="card"
            icon={<Icon name="triangle-alert" size="var(--icon-md)" />}
            title={t('pages.settings.profileError')}
            action={<Button onClick={() => profile.refetch()}>{t('common.retry')}</Button>}
          />
        ) : (
          <Card>
            <dl style={{ display: 'grid', rowGap: 'var(--space-4)', margin: 0 }}>
              {rows.map(([key, value]) => (
                <div key={key}>
                  <dt
                    style={{
                      fontSize: 'var(--text-caption)',
                      color: 'var(--text-muted)',
                      marginBottom: 'var(--space-1)',
                    }}
                  >
                    {t(`pages.settings.${key}`)}
                  </dt>
                  <dd style={{ margin: 0, ...(key === 'name' ? {} : mono) }}>{value}</dd>
                </div>
              ))}
            </dl>
          </Card>
        )}

        <h2 style={{ fontSize: 'var(--text-h3)', marginTop: 'var(--space-10)' }}>
          {t('pages.settings.password.title')}
        </h2>

        <form onSubmit={submit} noValidate style={{ marginTop: 'var(--space-4)' }}>
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <Input
                label={t('pages.settings.password.old')}
                type={show ? 'text' : 'password'}
                placeholder={t('pages.settings.password.oldPlaceholder')}
                autoComplete="current-password"
                value={values.oldPassword}
                onChange={set('oldPassword')}
                error={errorOf('oldPassword')}
                suffix={eye}
              />
              <Input
                label={t('pages.settings.password.new')}
                type={show ? 'text' : 'password'}
                placeholder={t('pages.settings.password.newPlaceholder')}
                autoComplete="new-password"
                value={values.password}
                onChange={set('password')}
                error={errorOf('password')}
              />
              <Input
                label={t('pages.settings.password.repeat')}
                type={show ? 'text' : 'password'}
                placeholder={t('pages.settings.password.repeatPlaceholder')}
                autoComplete="new-password"
                value={values.repeat}
                onChange={set('repeat')}
                error={errorOf('repeat')}
              />
              <Button type="submit" disabled={mutation.isPending}>
                {t(
                  mutation.isPending
                    ? 'pages.settings.password.submitting'
                    : 'pages.settings.password.submit',
                )}
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </PageShell>
  );
}
