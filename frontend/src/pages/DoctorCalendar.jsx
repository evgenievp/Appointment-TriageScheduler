import { useParams } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import PagePlaceholder from '../components/PagePlaceholder';

export default function DoctorCalendar() {
  const { id } = useParams();
  const { t } = useTranslation();

  return (
    <PagePlaceholder title={t('pages.doctorCalendar.title')} active="booking">
      <Trans
        i18nKey="pages.doctorCalendar.text"
        values={{ id }}
        components={{ mono: <span className="mono" /> }}
      />
    </PagePlaceholder>
  );
}
