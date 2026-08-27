import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageShell from '../components/PageShell';
import { Button, Icon } from '../components/ds';
import { useAuth } from '../lib/authContext';
import illustration from '../assets/not-found.webp';

// Без този маршрут несъвпадащ адрес не рисува нищо — бяла страница без хедър и
// без изход освен стрелката „назад“ на браузъра.

const mono = { fontFamily: 'var(--font-mono)', fontWeight: 'var(--fw-mono)' };

// Началото на всяка роля е различно: лекарят няма пациентски запис, а персоналът
// работи от таблото си.
const homeFor = (role) => {
  if (role === 'DOCTOR') return { to: '/doctor/appointments', key: 'toSchedule' };
  if (role === 'STAFF') return { to: '/staff', key: 'toStaff' };
  return { to: '/', key: 'toHome' };
};

export default function NotFound() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const home = homeFor(user?.role);

  return (
    <PageShell>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 'var(--space-6)',
          maxWidth: 'var(--measure)',
          margin: '0 auto',
        }}
      >
        <img
          src={illustration}
          alt={t('notFound.imageAlt')}
          style={{
            width: '100%',
            maxWidth: 'var(--illustration-max)',
            height: 'auto',
            borderRadius: 'var(--radius)',
          }}
        />

        <div>
          <h1>{t('notFound.title')}</h1>
          <p
            style={{
              color: 'var(--text-strong-muted)',
              marginTop: 'var(--space-3)',
            }}
          >
            {t('notFound.lead')}
          </p>
        </div>

        <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--text-muted)' }}>
          {t('notFound.attempted')}{' '}
          <span style={mono}>{location.pathname}</span>
        </p>

        <div
          style={{
            display: 'flex',
            gap: 'var(--space-3)',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <Button
            onClick={() => navigate(home.to)}
            iconLeft={<Icon name="house" size="var(--icon-sm)" />}
          >
            {t(`notFound.${home.key}`)}
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            iconLeft={<Icon name="arrow-left" size="var(--icon-sm)" />}
          >
            {t('notFound.back')}
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
