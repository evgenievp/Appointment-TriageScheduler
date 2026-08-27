import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import SiteHeader from '../components/SiteHeader';
import DoctorsFallback from '../components/doctors/DoctorsFallback';
import {
  AppointmentRow,
  Badge,
  Button,
  Card,
  DoctorCard,
  Icon,
  Tag,
} from '../components/ds';
import { getDoctors } from '../api/doctors';
import { iconForSpeciality } from '../lib/specialities';
import { CLINIC } from '../clinic';
import './Home.css';

// Началната страница по дизайна от Claude Design (Home.html).
// Фаза 0: НЯМА заявки към бекенд. Примерните данни живеят в преводите под
// `home.demo.*` — така страницата няма твърд текст и demo-то се трие наведнъж,
// щом дойде истинското API.

const mono = { fontFamily: 'var(--font-mono)', fontWeight: 'var(--fw-mono)' };
const micro = {
  fontSize: 'var(--text-micro)',
  fontWeight: 'var(--fw-semibold)',
  letterSpacing: 'var(--ls-label)',
  textTransform: 'uppercase',
};
const shell = {
  maxWidth: 'var(--container-max)',
  margin: '0 auto',
  padding: '0 var(--gutter)',
};
const section = { ...shell, padding: 'var(--section-padding-y-md) var(--gutter)' };

function Hero() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  // TODO(Фаза 1): идва от GET /api/doctors/{id}/slots?status=FREE
  const nextFree = t('home.demo.nextFree', { returnObjects: true });

  return (
    <section
      style={{
        background: 'var(--navy-500)',
        padding: 'var(--section-padding-y) var(--gutter)',
      }}
    >
      <div className="home-hero">
        <div>
          <h1
            style={{
              fontSize: 'var(--text-display)',
              lineHeight: 'var(--lh-tight)',
              letterSpacing: 'var(--ls-heading)',
              color: 'var(--text-on-dark)',
            }}
          >
            {t('home.hero.title')}
          </h1>
          <p
            style={{
              fontSize: 'var(--text-h4)',
              lineHeight: 'var(--lh-body)',
              color: 'var(--text-on-dark-muted)',
              marginTop: 'var(--space-4)',
              maxWidth: 'var(--measure-narrow)',
            }}
          >
            {t('home.hero.lead', { clinic: t('common.clinicName') })}
          </p>
          <div
            style={{
              display: 'flex',
              gap: 'var(--space-3)',
              marginTop: 'var(--space-8)',
              flexWrap: 'wrap',
            }}
          >
            {/* Призивът започва потока и води към въпросите — точно както обещава
                разделът „Как работи“ отдолу. Линкът „Вижте всички лекари“ си
                остава разглеждане и води направо към списъка. */}
            <Button size="lg" onClick={() => navigate('/triage')}>
              {t('home.hero.book')}
            </Button>
            <Button
              size="lg"
              variant="dark"
              style={{ border: 'var(--border-width) solid var(--border-on-dark)' }}
              onClick={() => navigate('/register')}
            >
              {t('home.hero.register')}
            </Button>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              marginTop: 'var(--space-6)',
              color: 'var(--text-on-dark-soft)',
              fontSize: 'var(--text-body-md)',
            }}
          >
            <Icon name="phone" size="var(--icon-sm)" />
            <span>
              <Trans
                i18nKey="home.hero.phone"
                values={{ phone: CLINIC.phone }}
                components={{ mono: <span style={mono} /> }}
              />
            </span>
          </div>
        </div>

        <Card tone="glass" style={{ color: 'var(--text-on-dark)' }}>
          <div style={{ ...micro, color: 'var(--text-on-dark-faint)' }}>
            {t('home.glass.title')}
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
              marginTop: 'var(--space-3)',
            }}
          >
            {nextFree.map((s) => (
              <div key={s} style={{ ...mono, fontSize: 'var(--text-body-sm)' }}>
                {s}
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: 'var(--space-4)',
              paddingTop: 'var(--space-4)',
              borderTop: 'var(--border-width) solid var(--border-on-dark-subtle)',
              fontSize: 'var(--text-body-sm)',
              color: 'var(--text-on-dark-soft)',
            }}
          >
            <Trans
              i18nKey="home.glass.asOf"
              values={{ time: t('home.demo.time') }}
              components={{ mono: <span style={mono} /> }}
            />
          </div>
        </Card>
      </div>
    </section>
  );
}

function Doctors() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [filterIdx, setFilterIdx] = useState(0);
  const [selected, setSelected] = useState(null);

  // Истинските лекари, не примерните: измислените карти водеха към календар на
  // несъществуващ лекар. Заявката е същата, която ползва и `/doctors`, тоест
  // втората страница я взима от кеша.
  const {
    data: doctors,
    isPending,
    isError,
    refetch,
  } = useQuery({ queryKey: ['doctors'], queryFn: getDoctors });

  // Индекс 0 е „всички“; филтърът се пази като индекс, а не като текст, за да
  // преживее смяна на езика.
  const specialties = [
    t('home.doctors.filterAll'),
    ...new Set((doctors ?? []).map((d) => d.speciality)),
  ];
  const list =
    filterIdx === 0
      ? (doctors ?? [])
      : (doctors ?? []).filter((d) => d.speciality === specialties[filterIdx]);

  // Мрежата се рисува само когато наистина има какво — иначе `DoctorsFallback`
  // казва защо я няма и се връща `null`, щом всичко е наред.
  const ready = !isPending && !isError && doctors?.length > 0;

  return (
    <section style={section}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: 'var(--space-6)',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h2>{t('home.doctors.title')}</h2>
          {/* Броят се показва само когато го знаем — „0 лекари“ докато се зарежда
              е по-лошо от нищо. */}
          <p style={{ color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>
            {list.length > 0 ? (
              <Trans
                i18nKey="home.doctors.count"
                values={{ count: list.length }}
                components={{ mono: <span style={mono} /> }}
              />
            ) : (
              t('home.doctors.lead')
            )}
          </p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/doctors')}>
          {t('home.doctors.seeAll')}
        </Button>
      </div>

      <DoctorsFallback
        isPending={isPending}
        isError={isError}
        isEmpty={doctors?.length === 0}
        onRetry={refetch}
        style={{ marginTop: 'var(--space-6)' }}
      />

      {ready && (
        <>
          <div
            style={{
              display: 'flex',
              gap: 'var(--space-2)',
              flexWrap: 'wrap',
              margin: 'var(--space-6) 0',
            }}
          >
            {specialties.map((s, i) => (
              <span key={s} onClick={() => setFilterIdx(i)} style={{ cursor: 'pointer' }}>
                <Tag selected={filterIdx === i}>{s}</Tag>
              </span>
            ))}
          </div>

          <div className="home-docs">
            {list.map((d) => (
              <DoctorCard
                key={d.id}
                icon={
                  <Icon name={iconForSpeciality(d.speciality)} size="var(--icon-md)" />
                }
                name={d.name}
                specialty={d.speciality}
                selected={selected === d.id}
                onClick={() => setSelected(d.id)}
              />
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: 'var(--space-6)',
            }}
          >
            <Button
              disabled={!selected}
              onClick={() => navigate(`/doctors/${selected}/calendar`)}
            >
              {t('home.doctors.seeSlots')}
            </Button>
          </div>
        </>
      )}
    </section>
  );
}

function How() {
  const { t } = useTranslation();
  const steps = t('home.how.steps', { returnObjects: true });

  return (
    <section
      id="how"
      style={{
        background: 'var(--surface-sunken)',
        padding: 'var(--section-padding-y-md) 0',
      }}
    >
      <div style={shell}>
        <h2>{t('home.how.title')}</h2>
        <div className="home-how" style={{ marginTop: 'var(--space-6)' }}>
          {steps.map((s) => (
            <Card key={s.step}>
              <div
                style={{
                  ...mono,
                  fontSize: 'var(--text-h2)',
                  color: 'var(--navy-900)',
                  letterSpacing: 'var(--ls-heading)',
                }}
              >
                {s.step}
              </div>
              <div
                style={{
                  fontSize: 'var(--text-h4)',
                  fontWeight: 'var(--fw-bold)',
                  letterSpacing: 'var(--ls-heading)',
                  color: 'var(--navy-900)',
                  marginTop: 'var(--space-3)',
                }}
              >
                {s.title}
              </div>
              <p
                style={{
                  fontSize: 'var(--text-body-md)',
                  lineHeight: 'var(--lh-body)',
                  color: 'var(--text-muted)',
                  marginTop: 'var(--space-2)',
                }}
              >
                {s.text}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function Upcoming() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const appt = t('home.demo.appointment', { returnObjects: true });

  return (
    <section style={section}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 'var(--space-4)',
          flexWrap: 'wrap',
        }}
      >
        <h2>{t('home.upcoming.title')}</h2>
        <Button variant="ghost" onClick={() => navigate('/me/appointments')}>
          {t('home.upcoming.seeAll')}
        </Button>
      </div>

      {/* TODO(Фаза 1): идва от GET /api/me/appointments; при липса на вход — покана за вход */}
      <div style={{ marginTop: 'var(--space-5)' }}>
        <AppointmentRow
          date={appt.date}
          time={appt.time}
          doctor={appt.doctor}
          specialty={appt.specialty}
          location={`${t('common.clinicName')}, ${appt.room}`}
          status={<Badge tone="blue">{t('home.upcoming.confirmed')}</Badge>}
          actions={
            <>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => navigate('/me/appointments')}
              >
                {t('home.upcoming.reschedule')}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate('/me/appointments')}
              >
                {t('home.upcoming.cancel')}
              </Button>
            </>
          }
        />
      </div>

      <Card
        tone="sunken"
        padding="var(--card-padding-sm)"
        style={{
          marginTop: 'var(--space-4)',
          display: 'flex',
          gap: 'var(--space-3)',
          alignItems: 'center',
        }}
      >
        <Icon name="shield-check" size="var(--icon-sm)" />
        <span
          style={{ fontSize: 'var(--text-body-sm)', color: 'var(--text-strong-muted)' }}
        >
          <Trans
            i18nKey="home.upcoming.safety"
            values={{ phone: CLINIC.emergencyPhone }}
            components={{ mono: <span style={mono} /> }}
          />
        </span>
      </Card>
    </section>
  );
}

function Footer() {
  const { t } = useTranslation();

  return (
    <footer
      style={{
        background: 'var(--navy-900)',
        color: 'var(--text-on-dark)',
        padding: 'var(--section-padding-y-sm) var(--gutter)',
      }}
    >
      <div
        style={{
          ...shell,
          padding: 0,
          display: 'flex',
          justifyContent: 'space-between',
          gap: 'var(--space-6)',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontSize: 'var(--text-h4)',
            fontWeight: 'var(--fw-bold)',
            letterSpacing: 'var(--ls-heading)',
          }}
        >
          {t('common.clinicName')}
        </span>
        <span
          style={{
            fontSize: 'var(--text-body-sm)',
            color: 'var(--text-on-dark-muted)',
          }}
        >
          {t('footer.emergency')}: <span style={mono}>{CLINIC.emergencyPhone}</span> ·{' '}
          {t('footer.reception')}: <span style={mono}>{CLINIC.phone}</span>
        </span>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <>
      <SiteHeader active="booking" />
      <Hero />
      <Doctors />
      <How />
      <Upcoming />
      <Footer />
    </>
  );
}
