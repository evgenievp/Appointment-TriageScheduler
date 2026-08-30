import { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import PageShell from '../components/PageShell';
import { Button, Card, Icon, Input, Select } from '../components/ds';
import { findPatientByPhone, promoteToDoctor, promoteToStaff } from '../api/staff';
import { countries, DEFAULT_COUNTRY, isValidPhone, toE164 } from '../lib/phone';
import { useToast } from '../lib/toastContext';

// Смяна на роля от регистратурата.
//
// Търси се по телефон, защото ендпойнт по имейл няма — а и служителят знае
// телефона на човека, не имейла му. Повишаването после иска имейл, но той идва
// в отговора на търсенето.
//
// Човекът се вижда, преди да получи правата: за смяна на роля „кого повишавам“
// не е дребен въпрос.
//
// Тук не се създават профили. Човекът се регистрира сам, после му се дава роля.

const mono = { fontFamily: 'var(--font-mono)', fontWeight: 'var(--fw-mono)' };

export default function StaffRoles() {
  const { t, i18n } = useTranslation();
  const showToast = useToast();

  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [phone, setPhone] = useState('');
  const [found, setFound] = useState(null);
  const [role, setRole] = useState('STAFF');
  const [speciality, setSpeciality] = useState('');

  const countryList = useMemo(() => countries(i18n.resolvedLanguage), [i18n.resolvedLanguage]);
  const normalized = isValidPhone(phone, country) ? toE164(phone, country) : null;
  const isDoctor = role === 'DOCTOR';

  const search = useMutation({
    mutationFn: () => findPatientByPhone(normalized),
    onSuccess: (person) => setFound(person ?? null),
  });

  // Сървърът връща 500 и за ненамерен, и за дублиран номер — не ги различаваме.
  const notFound = search.isError || (search.isSuccess && !found);

  const promote = useMutation({
    mutationFn: () =>
      isDoctor
        ? promoteToDoctor(found.email, speciality.trim())
        : promoteToStaff(found.email),
    onSuccess: () => {
      showToast({
        tone: 'success',
        title: t(isDoctor ? 'pages.staffRoles.doneDoctor' : 'pages.staffRoles.doneStaff'),
        message: t('pages.staffRoles.doneMessage', { name: found.name }),
      });
      setFound(null);
      setPhone('');
      setSpeciality('');
      search.reset();
      promote.reset();
    },
  });

  const reset = () => {
    setFound(null);
    search.reset();
    promote.reset();
  };

  return (
    <PageShell active="roles">
      <div style={{ maxWidth: 'var(--measure)' }}>
        <h1>{t('pages.staffRoles.title')}</h1>
        <p
          style={{
            color: 'var(--text-muted)',
            marginTop: 'var(--space-3)',
            marginBottom: 'var(--space-8)',
            maxWidth: 'var(--measure-prose)',
          }}
        >
          {t('pages.staffRoles.lead')}
        </p>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (normalized) search.mutate();
          }}
          noValidate
        >
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
                onChange={(event) => {
                  setCountry(event.target.value);
                  reset();
                }}
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
                label={t('pages.staffRoles.phone')}
                mono
                type="tel"
                autoComplete="off"
                placeholder={t('auth.register.phonePlaceholder')}
                value={phone}
                onChange={(event) => {
                  setPhone(event.target.value);
                  reset();
                }}
                hint={
                  normalized ? (
                    <Trans
                      i18nKey="staffBooking.assign.willSearch"
                      values={{ phone: normalized }}
                      components={{ mono: <span style={mono} /> }}
                    />
                  ) : (
                    t('pages.staffRoles.phoneHint')
                  )
                }
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={!normalized || search.isPending}
            style={{ marginTop: 'var(--space-4)' }}
          >
            {t(search.isPending ? 'staffBooking.assign.searching' : 'staffBooking.assign.search')}
          </Button>
        </form>

        {notFound && (
          <Card style={{ marginTop: 'var(--space-6)' }}>
            <h2 style={{ fontSize: 'var(--text-h4)' }}>{t('pages.staffRoles.notFoundTitle')}</h2>
            <p style={{ color: 'var(--text-strong-muted)', marginTop: 'var(--space-2)' }}>
              {t('pages.staffRoles.notFoundText')}
            </p>
          </Card>
        )}

        {found && (
          <Card style={{ marginTop: 'var(--space-6)' }}>
            <div style={{ fontWeight: 'var(--fw-semibold)', color: 'var(--navy-900)' }}>
              {found.name}
            </div>
            <div style={{ marginTop: 'var(--space-2)', color: 'var(--text-strong-muted)' }}>
              {found.email}
            </div>
            <div style={{ ...mono, marginTop: 'var(--space-1)', color: 'var(--text-muted)' }}>
              {found.phone}
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)',
                marginTop: 'var(--space-6)',
              }}
            >
              <Select
                label={t('pages.staffRoles.role')}
                value={role}
                onChange={(event) => setRole(event.target.value)}
              >
                <option value="STAFF">{t('pages.staffRoles.roleStaff')}</option>
                <option value="DOCTOR">{t('pages.staffRoles.roleDoctor')}</option>
              </Select>

              {isDoctor && (
                <Input
                  label={t('pages.staffRoles.speciality')}
                  autoComplete="off"
                  placeholder={t('pages.staffRoles.specialityPlaceholder')}
                  value={speciality}
                  onChange={(event) => setSpeciality(event.target.value)}
                  hint={t('pages.staffRoles.specialityHint')}
                />
              )}

              <Button
                disabled={promote.isPending || (isDoctor && !speciality.trim())}
                onClick={() => promote.mutate()}
                iconLeft={<Icon name="shield-check" size="var(--icon-sm)" />}
              >
                {t(promote.isPending ? 'pages.staffRoles.working' : 'pages.staffRoles.submit')}
              </Button>

              {promote.isError && (
                <span style={{ color: 'var(--danger)', fontSize: 'var(--text-body-sm)' }}>
                  {t('pages.staffRoles.failed')}
                </span>
              )}
            </div>
          </Card>
        )}

        <Card tone="sunken" style={{ marginTop: 'var(--space-8)' }}>
          <p style={{ color: 'var(--text-strong-muted)', fontSize: 'var(--text-body-sm)' }}>
            {t('pages.staffRoles.note')}
          </p>
        </Card>
      </div>
    </PageShell>
  );
}
