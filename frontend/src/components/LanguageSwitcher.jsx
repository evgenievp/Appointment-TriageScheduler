import { useTranslation } from 'react-i18next';
import { Button } from './ds';

// Един бутон, който показва езика, към който ще превключи. Изборът се помни
// в localStorage от детектора на i18next.
// `onDark` е за тъмен фон — там navy текстът не се чете.
export default function LanguageSwitcher({ onDark }) {
  const { t, i18n } = useTranslation();
  const next = i18n.resolvedLanguage === 'bg' ? 'en' : 'bg';

  return (
    <Button
      size="sm"
      variant="ghost"
      style={onDark ? { color: 'var(--text-on-dark)' } : undefined}
      title={t('lang.switchToTitle')}
      aria-label={t('lang.switchToTitle')}
      onClick={() => i18n.changeLanguage(next)}
    >
      {t('lang.switchTo')}
    </Button>
  );
}
