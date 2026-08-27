import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, EmptyState, ErrorState, Icon, Skeleton } from '../ds';
import { useAuth } from '../../lib/authContext';

// Четирите състояния, в които списъкът с лекари не може да се покаже. Стоят на
// едно място, защото и началната страница, и `/doctors` показват същия списък —
// а разминаване между двете щеше да си личи веднага.
//
// Връща `null`, когато данните са наред и се рисуват карти.
export default function DoctorsFallback({
  isPending,
  isError,
  isEmpty,
  onRetry,
  count = 6,
  style,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Обвивката е вътре, а не около компонента: празен `div` с отстъп отвън би
  // оставял мъртво разстояние над мрежата, когато всичко е наред.
  const wrap = (children) => <div style={style}>{children}</div>;

  if (isPending) {
    return wrap(
      <Skeleton variant="doctor-grid" count={count} label={t('common.loading')} />,
    );
  }

  // Бекендът държи и списъка с лекари зад `authenticated()`, тоест невлязъл
  // посетител получава 403. Да го наречем „грешка във връзката“ е лъжа — човекът
  // ще реши, че сайтът е счупен, а всъщност само не е влязъл.
  if (isError && !isAuthenticated) {
    return wrap(
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
      />,
    );
  }

  if (isError) {
    return wrap(
      <ErrorState
        icon={<Icon name="triangle-alert" size="var(--icon-md)" />}
        title={t('doctors.errorTitle')}
        description={t('doctors.errorText')}
        action={onRetry && <Button onClick={onRetry}>{t('common.retry')}</Button>}
      />,
    );
  }

  if (isEmpty) {
    return wrap(
      <EmptyState
        icon={<Icon name="calendar-x" size="var(--icon-md)" />}
        title={t('doctors.emptyTitle')}
        description={t('doctors.emptyText')}
      />,
    );
  }

  return null;
}
