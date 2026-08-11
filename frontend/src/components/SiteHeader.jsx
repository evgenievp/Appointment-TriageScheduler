import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, GlassHeader } from './ds';
import LanguageSwitcher from './LanguageSwitcher';

// Общата навигация за всички страници. Sticky glass header от дизайн системата.
// Няма auth guard — линкът към /staff е видим, защото роли още няма (Фаза 0).
export default function SiteHeader({ active }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <GlassHeader
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
          <LanguageSwitcher />
          <Button size="sm" variant="ghost" onClick={() => navigate('/login')}>
            {t('nav.login')}
          </Button>
          <Button size="sm" onClick={() => navigate('/doctors')}>
            {t('nav.book')}
          </Button>
        </>
      }
    />
  );
}
