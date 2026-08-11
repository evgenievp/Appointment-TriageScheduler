import { useTranslation } from 'react-i18next';
import PagePlaceholder from '../components/PagePlaceholder';

export default function StaffDashboard() {
  const { t } = useTranslation();

  return (
    <PagePlaceholder title={t('pages.staffDashboard.title')} active="staff">
      {t('pages.staffDashboard.text')}
    </PagePlaceholder>
  );
}
