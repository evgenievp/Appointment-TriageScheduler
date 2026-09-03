import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Dialog } from '../ds';
import { cancelAppointment } from '../../api/appointments';
import { formatDayLong, fromLocalDateTime } from '../../lib/dates';
import { useAuth } from '../../lib/authContext';
import { useToast } from '../../lib/toastContext';
import { useNow } from '../../lib/useNow';
import { CLINIC } from '../../clinic';
import { CHANGE_WINDOW_HOURS } from '../../lib/appointmentRules';

// The backend deletes the row instead of marking it CANCELLED, so there is no
// undo — hence the confirmation step. `delete` accepts the patient who owns the
// visit or any STAFF member, so the same button serves both.
const mono = { fontFamily: 'var(--font-mono)', fontWeight: 'var(--fw-mono)' };

export default function CancelAppointmentButton({ appointment }) {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const showToast = useToast();
  const { user } = useAuth();

  const [open, setOpen] = useState(false);
  const now = useNow();
  const isStaff = user?.role === 'STAFF';

  const at = fromLocalDateTime(appointment.appointmentTime);
  const hoursAway = (at.getTime() - now) / 3_600_000;

  const mutation = useMutation({
    mutationFn: () => cancelAppointment(appointment.appointmentId),
    onSuccess: () => {
      setOpen(false);
      // Both the lists and the freed slot are stale the moment this returns.
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['slots'] });
      showToast({
        tone: 'success',
        title: t('appointments.cancel.doneTitle'),
        message: t('appointments.cancel.doneMessage'),
      });
    },
    onError: (error) => {
      const forbidden = error?.status === 403;
      showToast({
        tone: 'danger',
        title: t(
          forbidden
            ? 'appointments.cancel.forbiddenTitle'
            : 'appointments.cancel.failedTitle',
        ),
        message: t(
          forbidden
            ? 'appointments.cancel.forbiddenMessage'
            : 'appointments.cancel.failedMessage',
        ),
      });
    },
  });

  // A visit that already happened, or one already cancelled, has nothing to
  // cancel — the row marks it as past instead.
  if (appointment.status !== 'CONFIRMED' || hoursAway <= 0) return null;

  const tooLate = !isStaff && hoursAway < CHANGE_WINDOW_HOURS;
  const when = `${formatDayLong(at, i18n.resolvedLanguage)}, ${appointment.appointmentTime.slice(11, 16)}`;
  const close = () => !mutation.isPending && setOpen(false);

  // Reception sees rows that look alike; naming the patient makes cancelling the
  // wrong one much harder, and there is no undo.
  const forPatient = isStaff && appointment.patientName;

  return (
    <>
      <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>
        {t('appointments.cancel.action')}
      </Button>

      <Dialog
        open={open}
        onClose={close}
        title={t(
          tooLate ? 'appointments.cancel.lateTitle' : 'appointments.cancel.title',
          { hours: CHANGE_WINDOW_HOURS },
        )}
        description={t(
          tooLate ? 'appointments.cancel.lateText' : 'appointments.cancel.text',
          { hours: CHANGE_WINDOW_HOURS },
        )}
        footer={
          tooLate ? (
            <Button variant="secondary" onClick={close}>
              {t('appointments.cancel.close')}
            </Button>
          ) : (
            <>
              <Button variant="secondary" disabled={mutation.isPending} onClick={close}>
                {t('appointments.cancel.keep')}
              </Button>
              <Button disabled={mutation.isPending} onClick={() => mutation.mutate()}>
                {t(
                  mutation.isPending
                    ? 'appointments.cancel.cancelling'
                    : 'appointments.cancel.confirm',
                )}
              </Button>
            </>
          )
        }
      >
        <p>
          <Trans
            i18nKey={
              tooLate
                ? 'appointments.cancel.lateCall'
                : forPatient
                  ? 'appointments.cancel.whichFor'
                  : 'appointments.cancel.which'
            }
            values={{ when, phone: CLINIC.phone, patient: appointment.patientName }}
            components={{ mono: <span style={mono} /> }}
          />
        </p>
      </Dialog>
    </>
  );
}
