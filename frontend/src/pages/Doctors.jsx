import { useTranslation } from 'react-i18next';
import PagePlaceholder from '../components/PagePlaceholder';

export default function Doctors() {
  const { t } = useTranslation();

  return (
    <PagePlaceholder title={t('pages.doctors.title')} active="booking">
      {t('pages.doctors.text')}
    </PagePlaceholder>
  );
}
