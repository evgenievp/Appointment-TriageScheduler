import { useTranslation } from 'react-i18next';
import { Button } from './ds';

// Един бутон, който показва езика, към който ще превключи. Изборът се помни
// в localStorage от детектора на i18next.
export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const next = i18n.resolvedLanguage === 'bg' ? 'en' : 'bg';

  return (
    <Button
      size="sm"
      variant="ghost"
      title={t('lang.switchToTitle')}
      aria-label={t('lang.switchToTitle')}
      onClick={() => i18n.changeLanguage(next)}
    >
      {t('lang.switchTo')}
    </Button>
  );
}
