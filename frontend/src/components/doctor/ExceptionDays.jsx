import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Badge,
  Button,
  Card,
  DatePicker,
  ErrorState,
  Icon,
  IconButton,
  Select,
  Skeleton,
} from '../ds';
import { addException, deleteException, getMyExceptions } from '../../api/doctors';
import { addDays, formatDayLong, formatWeekday, toDateInput } from '../../lib/dates';
import { useToast } from '../../lib/toastContext';
// Споделя грида и реда по дни със страницата, на която единствено се ползва.
import '../../pages/DoctorSlots.css';

const REASONS = ['RESTDAY', 'HOLIDAY'];

// `onChange` refreshes the slot preview above — a day added or removed changes
// what generating would produce.
export default function ExceptionDays({ onChange }) {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const showToast = useToast();

  const [form, setForm] = useState({
    date: toDateInput(addDays(new Date(), 1)),
    reason: 'RESTDAY',
  });

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['exceptions', 'me'],
    queryFn: getMyExceptions,
  });

  const days = [...(data ?? [])].sort((a, b) => a.date.localeCompare(b.date));
  // The backend happily stores the same day twice and then skips it once, so the
  // duplicate would only ever confuse the list.
  const duplicate = days.some((day) => day.date === form.date);

  const done = (titleKey) => {
    queryClient.invalidateQueries({ queryKey: ['exceptions', 'me'] });
    queryClient.invalidateQueries({ queryKey: ['slots'] });
    onChange?.();
    showToast({ tone: 'success', title: t(titleKey) });
  };

  const failed = () =>
    showToast({
      tone: 'danger',
      title: t('pages.doctorSlots.exceptions.failedTitle'),
      message: t('pages.doctorSlots.exceptions.failedMessage'),
    });

  const add = useMutation({
    mutationFn: () => addException(form),
    onSuccess: () => done('pages.doctorSlots.exceptions.addedTitle'),
    onError: failed,
  });

  const remove = useMutation({
    mutationFn: deleteException,
    onSuccess: () => done('pages.doctorSlots.exceptions.removedTitle'),
    onError: failed,
  });

  const set = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const submit = (event) => {
    event.preventDefault();
    if (!duplicate) add.mutate();
  };

  return (
    <Card style={{ marginTop: 'var(--space-6)' }}>
      <h2 style={{ fontSize: 'var(--text-h3)' }}>
        {t('pages.doctorSlots.exceptions.title')}
      </h2>
      <p
        style={{
          color: 'var(--text-muted)',
          fontSize: 'var(--text-body-sm)',
          marginTop: 'var(--space-2)',
          marginBottom: 'var(--space-6)',
          maxWidth: 'var(--measure-prose)',
        }}
      >
        {t('pages.doctorSlots.exceptions.lead')}
      </p>

      {isPending && <Skeleton variant="text" rows={3} label={t('common.loading')} />}

      {isError && (
        <ErrorState
          compact
          align="left"
          surface="card"
          icon={<Icon name="triangle-alert" size="var(--icon-md)" />}
          title={t('pages.doctorSlots.exceptions.errorTitle')}
          description={t('pages.doctorSlots.exceptions.errorText')}
          action={<Button onClick={refetch}>{t('common.retry')}</Button>}
        />
      )}

      {!isPending && !isError && (
        <>
          {days.length > 0 ? (
            <div style={{ marginBottom: 'var(--space-6)' }}>
              {days.map((day) => {
                const at = new Date(`${day.date}T00:00:00`);
                return (
                  <div key={day.id} className="slots-day">
                    <span>
                      {formatDayLong(at, i18n.resolvedLanguage)},{' '}
                      <span style={{ color: 'var(--text-muted)' }}>
                        {formatWeekday(at, i18n.resolvedLanguage)}
                      </span>
                    </span>
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-3)',
                      }}
                    >
                      <Badge tone="soon">
                        {t(`pages.doctorSlots.exceptions.reason.${day.reason}`, day.reason)}
                      </Badge>
                      <IconButton
                        variant="ghost"
                        size="var(--icon-btn-size-sm)"
                        label={t('pages.doctorSlots.exceptions.remove')}
                        disabled={remove.isPending}
                        onClick={() => remove.mutate(day.id)}
                      >
                        <Icon name="trash-2" size="var(--icon-sm)" />
                      </IconButton>
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: 'var(--text-body-sm)',
                marginBottom: 'var(--space-6)',
              }}
            >
              {t('pages.doctorSlots.exceptions.empty')}
            </p>
          )}

          <form onSubmit={submit} noValidate>
            <div className="slots-fields">
              <DatePicker
                label={t('pages.doctorSlots.exceptions.date')}
                value={form.date}
                onChange={(value) => setForm((current) => ({ ...current, date: value }))}
              />
              <Select
                label={t('pages.doctorSlots.exceptions.reasonLabel')}
                value={form.reason}
                onChange={set('reason')}
              >
                {REASONS.map((reason) => (
                  <option key={reason} value={reason}>
                    {t(`pages.doctorSlots.exceptions.reason.${reason}`)}
                  </option>
                ))}
              </Select>
            </div>

            <p
              style={{
                marginTop: 'var(--space-4)',
                fontSize: 'var(--text-caption)',
                color: duplicate ? 'var(--danger)' : 'var(--text-muted)',
              }}
            >
              {duplicate
                ? t('pages.doctorSlots.exceptions.duplicate')
                : t('pages.doctorSlots.exceptions.hint')}
            </p>

            <Button
              type="submit"
              variant="secondary"
              disabled={duplicate || add.isPending}
              style={{ marginTop: 'var(--space-6)' }}
            >
              {t(
                add.isPending
                  ? 'pages.doctorSlots.exceptions.adding'
                  : 'pages.doctorSlots.exceptions.add',
              )}
            </Button>
          </form>
        </>
      )}
    </Card>
  );
}
