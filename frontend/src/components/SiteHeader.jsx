import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, GlassHeader } from './ds';
import LanguageSwitcher from './LanguageSwitcher';

// Общата навигация за всички страници. Sticky glass header от дизайн системата.
// Няма auth guard — линкът към /staff е видим, защото роли още няма.
export default function SiteHeader({ active }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Езикът и входът са малки и остават в лентата на всяка ширина. „Запазете час“
  // е широкият бутон — на телефон той влиза в панела, иначе нищо не се побира.
  const smallActions = (
    <>
      <LanguageSwitcher />
      <Button size="sm" variant="ghost" onClick={() => navigate('/login')}>
        {t('nav.login')}
      </Button>
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
      links={[
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
        {
          label: t('nav.staff'),
          active: active === 'staff',
          onClick: () => navigate('/staff'),
        },
      ]}
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
