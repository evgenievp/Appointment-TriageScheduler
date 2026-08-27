import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import PageShell from '../components/PageShell';
import {
  Button,
  DoctorCard,
  EmptyState,
  ErrorState,
  Icon,
  Skeleton,
  Tag,
} from '../components/ds';
import BookingSteps from '../components/triage/BookingSteps';
import { getDoctors } from '../api/doctors';
import { iconForSpeciality } from '../lib/specialities';
import { useAuth } from '../lib/authContext';
import { useTriageDraft } from '../lib/triageDraft';
import './Doctors.css';

export default function Doctors() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { answers } = useTriageDraft();
  const [filterIdx, setFilterIdx] = useState(0);

  const {
    data: doctors,
    isPending,
    isError,
    refetch,
  } = useQuery({ queryKey: ['doctors'], queryFn: getDoctors });

  // Филтърът се пази като индекс, а не като текст — специалностите идват от
  // сървъра и се преподреждат при всяко зареждане.
  const specialities = [
    t('doctors.filterAll'),
    ...new Set((doctors ?? []).map((d) => d.speciality)),
  ];
  const visible =
    filterIdx === 0
      ? (doctors ?? [])
      : (doctors ?? []).filter((d) => d.speciality === specialities[filterIdx]);

  return (
    <PageShell active="booking">
      <h1>{t('doctors.title')}</h1>
      <p
        style={{
          color: 'var(--text-muted)',
          marginTop: 'var(--space-3)',
          maxWidth: 'var(--measure)',
        }}
      >
        {t('doctors.lead')}
      </p>

      {/* Само на човек, който е в потока — иначе „Оплакване ✓“ би било лъжа. */}
      {answers && <BookingSteps current={1} style={{ marginTop: 'var(--space-6)' }} />}

      {isPending && (
        <div style={{ marginTop: 'var(--space-8)' }}>
          <Skeleton variant="doctor-grid" count={6} label={t('common.loading')} />
        </div>
      )}

      {/* Бекендът държи и списъка с лекари зад `authenticated()`, тоест невлязъл
          посетител получава 403. Да го наречем „грешка във връзката“ е лъжа —
          човекът ще реши, че сайтът е счупен, а всъщност само не е влязъл. */}
      {isError && !isAuthenticated && (
        <div style={{ marginTop: 'var(--space-8)' }}>
          <EmptyState
            icon={<Icon name="shield-check" size="var(--icon-md)" />}
            title={t('doctors.signInTitle')}
            description={t('doctors.signInText')}
            action={
              <Button onClick={() => navigate(`/login?from=${location.pathname}`)}>
                {t('nav.login')}
              </Button>
            }
            secondaryAction={
              <Button variant="secondary" onClick={() => navigate('/register')}>
                {t('auth.login.register')}
              </Button>
            }
          />
        </div>
      )}

      {isError && isAuthenticated && (
        <div style={{ marginTop: 'var(--space-8)' }}>
          <ErrorState
            icon={<Icon name="triangle-alert" size="var(--icon-md)" />}
            title={t('doctors.errorTitle')}
            description={t('doctors.errorText')}
            action={<Button onClick={() => refetch()}>{t('common.retry')}</Button>}
          />
        </div>
      )}

      {!isPending && !isError && doctors.length === 0 && (
        <div style={{ marginTop: 'var(--space-8)' }}>
          <EmptyState
            icon={<Icon name="calendar-x" size="var(--icon-md)" />}
            title={t('doctors.emptyTitle')}
            description={t('doctors.emptyText')}
          />
        </div>
      )}

      {!isPending && !isError && doctors.length > 0 && (
        <>
          <div
            style={{
              display: 'flex',
              gap: 'var(--space-2)',
              flexWrap: 'wrap',
              margin: 'var(--space-6) 0',
            }}
          >
            {specialities.map((speciality, i) => (
              <span
                key={speciality}
                onClick={() => setFilterIdx(i)}
                style={{ cursor: 'pointer' }}
              >
                <Tag selected={filterIdx === i}>{speciality}</Tag>
              </span>
            ))}
          </div>

          <div className="doctors-grid">
            {visible.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                icon={
                  <Icon
                    name={iconForSpeciality(doctor.speciality)}
                    size="var(--icon-md)"
                  />
                }
                name={doctor.name}
                specialty={doctor.speciality}
                onClick={() => navigate(`/doctors/${doctor.id}/calendar`)}
              />
            ))}
          </div>
        </>
      )}
    </PageShell>
  );
}
