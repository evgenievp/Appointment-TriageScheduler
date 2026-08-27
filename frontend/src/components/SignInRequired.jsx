import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, EmptyState, Icon } from './ds';

// Част от бекенда е публична, друга не е. Когато затвореното върне 403 на
// невлязъл посетител, „грешка във връзката“ е лъжа — човекът ще реши, че сайтът
// е счупен, вместо да разбере, че трябва да влезе.
export default function SignInRequired({ style }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div style={style}>
      <EmptyState
        icon={<Icon name="shield-check" size="var(--icon-md)" />}
        title={t('doctors.signInTitle')}
        description={t('doctors.signInText')}
        action={
          <Button onClick={() => navigate(`/login?from=${location.pathname}`)}>
            {t('nav.login')}
          </Button>
        }
        secondaryAction={
          <Button variant="secondary" onClick={() => navigate('/register')}>
            {t('auth.login.register')}
          </Button>
        }
      />
    </div>
  );
}
