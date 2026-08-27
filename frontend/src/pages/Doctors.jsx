import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import PageShell from '../components/PageShell';
import { DoctorCard, Icon, Tag } from '../components/ds';
import BookingSteps from '../components/triage/BookingSteps';
import DoctorsFallback from '../components/doctors/DoctorsFallback';
import { getDoctors } from '../api/doctors';
import { iconForSpeciality } from '../lib/specialities';
import { useTriageDraft } from '../lib/triageDraft';
import './Doctors.css';

export default function Doctors() {
  const { t } = useTranslation();
  const navigate = useNavigate();
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

      <DoctorsFallback
        isPending={isPending}
        isError={isError}
        isEmpty={doctors?.length === 0}
        onRetry={refetch}
        style={{ marginTop: 'var(--space-8)' }}
      />

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
