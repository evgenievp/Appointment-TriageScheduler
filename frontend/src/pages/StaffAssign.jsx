import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PageShell from '../components/PageShell';
import BookingSteps from '../components/triage/BookingSteps';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Icon,
  Input,
  Select,
  Skeleton,
} from '../components/ds';
import { cancelAppointment, getMyAppointments } from '../api/appointments';
import { getDoctors } from '../api/doctors';
import { assignSlot, findPatientsByPhone } from '../api/staff';
import { countries, DEFAULT_COUNTRY, isValidPhone, toE164 } from '../lib/phone';
import { formatDayLong, fromLocalDateTime } from '../lib/dates';
import { useToast } from '../lib/toastContext';

// Последната стъпка на записването по телефона. Дотук служителят е минал по
// същите екрани като пациента и часът е записан на него — задържан е, докато
// говорят. Тук се решава чий става.
//
// Задържаното се чете от `GET /api/appointments/me`: часът още е на служителя,
// значи е в неговия списък. Ендпойнт за една резервация няма и не трябва.

const mono = { fontFamily: 'var(--font-mono)', fontWeight: 'var(--fw-mono)' };

export default function StaffAssign() {
  const { id } = useParams();
  const appointmentId = Number(id);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const showToast = useToast();

  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  // null — още не е търсено; масив — резултатът от последното търсене.
  const [found, setFound] = useState(null);

  const countryList = useMemo(() => countries(i18n.resolvedLanguage), [i18n.resolvedLanguage]);
  const normalized = isValidPhone(phone, country) ? toE164(phone, country) : null;

  const { data: mine, isPending } = useQuery({
    queryKey: ['appointments', 'me'],
    queryFn: getMyAppointments,
  });
  const { data: doctors } = useQuery({ queryKey: ['doctors'], queryFn: getDoctors });

  const held = mine?.find((a) => a.appointmentId === appointmentId);
  const doctor = doctors?.find((d) => d.id === held?.doctorId);

  const done = (titleKey, messageKey, values) => {
    queryClient.invalidateQueries({ queryKey: ['appointments'] });
    queryClient.invalidateQueries({ queryKey: ['slots'] });
    showToast({ tone: 'success', title: t(titleKey), message: t(messageKey, values) });
    navigate('/staff');
  };

  const failed = () =>
    showToast({
      tone: 'danger',
      title: t('staffBooking.assign.failedTitle'),
      message: t('staffBooking.assign.failedMessage'),
    });

  const search = useMutation({
    mutationFn: () => findPatientsByPhone(normalized),
    onSuccess: setFound,
    onError: failed,
  });

  const give = useMutation({
    mutationFn: (target) => assignSlot(held.slotId, target),
    onSuccess: (_, target) =>
      done('staffBooking.assign.doneTitle', 'staffBooking.assign.doneMessage', {
        name: target.name ?? found?.find((p) => p.id === target.patientId)?.name,
      }),
    onError: failed,
  });

  const release = useMutation({
    mutationFn: () => cancelAppointment(appointmentId),
    onSuccess: () =>
      done('staffBooking.assign.releasedTitle', 'staffBooking.assign.releasedMessage'),
    onError: failed,
  });

  const busy = give.isPending || release.isPending;

  if (isPending) {
    return (
      <PageShell active="staff">
        <Skeleton variant="text" rows={3} label={t('common.loading')} />
      </PageShell>
    );
  }

  // Няма го в списъка на служителя: или id-то е грешно, или часът вече е
  // прехвърлен и сега е на пациента. И в двата случая тук няма какво да се прави.
  if (!held) {
    return (
      <PageShell active="staff">
        <EmptyState
          icon={<Icon name="calendar-x" size="var(--icon-md)" />}
          title={t('staffBooking.assign.missingTitle')}
          description={t('staffBooking.assign.missingText')}
          action={<Button onClick={() => navigate('/staff')}>{t('staffBooking.assign.toDashboard')}</Button>}
        />
      </PageShell>
    );
  }

  const when = `${formatDayLong(fromLocalDateTime(held.appointmentTime), i18n.resolvedLanguage)}, ${held.appointmentTime.slice(11, 16)}`;

  return (
    <PageShell active="staff">
      <div style={{ maxWidth: 'var(--measure)' }}>
        <BookingSteps current={3} forStaff />

        <h1 style={{ marginTop: 'var(--space-8)' }}>{t('staffBooking.assign.title')}</h1>
        <p
          style={{
            color: 'var(--text-muted)',
            marginTop: 'var(--space-3)',
            maxWidth: 'var(--measure-prose)',
          }}
        >
          {t('staffBooking.assign.lead')}
        </p>

        <Card tone="sunken" style={{ marginTop: 'var(--space-6)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: 'var(--space-4)',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div style={{ fontWeight: 'var(--fw-semibold)', color: 'var(--navy-900)' }}>
                {doctor?.name ?? '—'}
              </div>
              <div style={{ ...mono, marginTop: 'var(--space-2)', color: 'var(--text-strong-muted)' }}>
                {when}
              </div>
            </div>
            {held.priority === 'URGENT' && (
              <Badge tone="urgent">{t('staffBooking.assign.urgent')}</Badge>
            )}
          </div>
        </Card>

        {/* Търсенето е по точен номер, затова полето нормализира като в
            регистрацията — иначе същият човек не се намира заради интервали. */}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (normalized) search.mutate();
          }}
          noValidate
          style={{ marginTop: 'var(--space-8)' }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 11rem', minWidth: 0 }}>
              <Select
                label={t('auth.register.country')}
                value={country}
                onChange={(event) => {
                  setCountry(event.target.value);
                  setFound(null);
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
                label={t('staffBooking.assign.phone')}
                mono
                type="tel"
                autoComplete="off"
                placeholder={t('auth.register.phonePlaceholder')}
                value={phone}
                onChange={(event) => {
                  setPhone(event.target.value);
                  setFound(null);
                }}
                hint={
                  normalized ? (
                    <Trans
                      i18nKey="staffBooking.assign.willSearch"
                      values={{ phone: normalized }}
                      components={{ mono: <span style={mono} /> }}
                    />
                  ) : (
                    t('staffBooking.assign.phoneHint')
                  )
                }
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={!normalized || search.isPending || busy}
            style={{ marginTop: 'var(--space-4)' }}
          >
            {t(search.isPending ? 'staffBooking.assign.searching' : 'staffBooking.assign.search')}
          </Button>
        </form>

        {found?.length > 0 && (
          <div style={{ marginTop: 'var(--space-6)', display: 'grid', gap: 'var(--space-3)' }}>
            {found.map((patient) => (
              <Card key={patient.id}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 'var(--space-4)',
                    flexWrap: 'wrap',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 'var(--fw-semibold)', color: 'var(--navy-900)' }}>
                      {patient.name}
                    </div>
                    <div style={{ ...mono, marginTop: 'var(--space-2)', color: 'var(--text-muted)' }}>
                      {patient.phone}
                    </div>
                  </div>
                  <Button
                    disabled={busy}
                    onClick={() => give.mutate({ patientId: patient.id })}
                    iconLeft={<Icon name="calendar-check" size="var(--icon-sm)" />}
                  >
                    {t(give.isPending ? 'staffBooking.assign.giving' : 'staffBooking.assign.give')}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Ненамерен не значи край на разговора: часът се записва на име и
            телефон и остава да се води на служителя. */}
        {found?.length === 0 && (
          <Card style={{ marginTop: 'var(--space-6)' }}>
            <h2 style={{ fontSize: 'var(--text-h4)' }}>
              {t('staffBooking.assign.notFoundTitle')}
            </h2>
            <p
              style={{
                color: 'var(--text-strong-muted)',
                marginTop: 'var(--space-2)',
                marginBottom: 'var(--space-4)',
              }}
            >
              {t('staffBooking.assign.notFoundText')}
            </p>
            <Input
              label={t('staffBooking.assign.name')}
              autoComplete="off"
              placeholder={t('auth.register.namePlaceholder')}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <Button
              disabled={!name.trim() || busy}
              onClick={() => give.mutate({ name: name.trim(), phone: normalized })}
              style={{ marginTop: 'var(--space-4)' }}
            >
              {t(give.isPending ? 'staffBooking.assign.giving' : 'staffBooking.assign.saveGuest')}
            </Button>
          </Card>
        )}

        <Card tone="sunken" padding="var(--card-padding-sm)" style={{ marginTop: 'var(--space-8)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--space-4)',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontSize: 'var(--text-body-sm)', color: 'var(--text-strong-muted)' }}>
              {t('staffBooking.assign.releaseHint')}
            </span>
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => release.mutate()}
              iconLeft={<Icon name="trash-2" size="var(--icon-sm)" />}
            >
              {t(release.isPending ? 'staffBooking.assign.releasing' : 'staffBooking.assign.release')}
            </Button>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
