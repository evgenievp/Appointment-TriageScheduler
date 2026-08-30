import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, GlassHeader } from './ds';
import LanguageSwitcher from './LanguageSwitcher';
import { useAuth } from '../lib/authContext';

export default function SiteHeader({ active }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, signOut } = useAuth();

  const isDoctor = user?.role === 'DOCTOR';

  // A doctor has no patient record, so the booking links would only lead to an
  // empty page. They get their own set instead.
  const links = [
    ...(isDoctor
      ? [
          {
            label: t('nav.schedule'),
            active: active === 'doctor',
            onClick: () => navigate('/doctor/appointments'),
          },
          {
            label: t('nav.workingHours'),
            active: active === 'slots',
            onClick: () => navigate('/doctor/slots'),
          },
        ]
      : [
          {
            label: t('nav.booking'),
            active: active === 'booking',
            onClick: () => navigate('/doctors'),
          },
          {
            label: t('nav.appointments'),
            active: active === 'appointments',
            onClick: () => navigate('/me/appointments'),
          },
        ]),
    ...(user?.role === 'STAFF'
      ? [
          {
            label: t('nav.staff'),
            active: active === 'staff',
            onClick: () => navigate('/staff'),
          },
          {
            label: t('nav.roles'),
            active: active === 'roles',
            onClick: () => navigate('/staff/roles'),
          },
        ]
      : []),
  ];

  // Language and session stay in the bar at every width; the wide CTA moves
  // into the burger panel on narrow screens.
  const smallActions = (
    <>
      <LanguageSwitcher />
      {user ? (
        <Button size="sm" variant="ghost" onClick={signOut}>
          {t('nav.logout')}
        </Button>
      ) : (
        <Button size="sm" variant="ghost" onClick={() => navigate('/login')}>
          {t('nav.login')}
        </Button>
      )}
    </>
  );

  // Бутонът е действие и започва потока от въпросите; линкът „Запазване на час“
  // е раздел и води направо към списъка с лекари.
  const bookButton = (fullWidth) => (
    <Button size="sm" fullWidth={fullWidth} onClick={() => navigate('/triage')}>
      {t('nav.book')}
    </Button>
  );

  return (
    <GlassHeader
      menuLabel={t('nav.menu')}
      logo={
        <span style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          {t('common.clinicName')}
        </span>
      }
      links={links}
      right={
        <>
          {smallActions}
          {!isDoctor && bookButton(false)}
        </>
      }
      rightCompact={smallActions}
      rightOnDark={isDoctor ? null : bookButton(true)}
    />
  );
}
