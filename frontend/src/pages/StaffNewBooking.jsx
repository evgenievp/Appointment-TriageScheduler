import { useTranslation } from 'react-i18next';
import PagePlaceholder from '../components/PagePlaceholder';

export default function StaffNewBooking() {
  const { t } = useTranslation();

  return (
    <PagePlaceholder title={t('pages.staffNewBooking.title')} active="staff">
      {t('pages.staffNewBooking.text')}
    </PagePlaceholder>
  );
}
