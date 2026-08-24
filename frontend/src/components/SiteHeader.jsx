import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, GlassHeader } from './ds';
import LanguageSwitcher from './LanguageSwitcher';
import { useAuth } from '../lib/authContext';

export default function SiteHeader({ active }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, signOut } = useAuth();

  const links = [
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
    // Hidden rather than shown and rejected: a patient clicking it would only
    // get bounced back.
    ...(user?.role === 'STAFF'
      ? [
          {
            label: t('nav.staff'),
            active: active === 'staff',
            onClick: () => navigate('/staff'),
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

  const bookButton = (fullWidth) => (
    <Button size="sm" fullWidth={fullWidth} onClick={() => navigate('/doctors')}>
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
          {bookButton(false)}
        </>
      }
      rightCompact={smallActions}
      rightOnDark={bookButton(true)}
    />
  );
}
