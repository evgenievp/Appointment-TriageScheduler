import { useTranslation } from 'react-i18next';
import PagePlaceholder from '../components/PagePlaceholder';

export default function Register() {
  const { t } = useTranslation();

  return (
    <PagePlaceholder title={t('pages.register.title')}>
      {t('pages.register.text')}
    </PagePlaceholder>
  );
}
