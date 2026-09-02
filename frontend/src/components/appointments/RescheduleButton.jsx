import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { Button, Dialog } from '../ds';
import { fromLocalDateTime } from '../../lib/dates';
import { useAuth } from '../../lib/authContext';
import { useNow } from '../../lib/useNow';
import { CHANGE_WINDOW_HOURS } from '../../lib/appointmentRules';
import { CLINIC } from '../../clinic';

const mono = { fontFamily: 'var(--font-mono)', fontWeight: 'var(--fw-mono)' };

// Sends the patient to the doctor's calendar with the visit to move in the
// URL. The calendar does the rest; this button only decides whether moving is
// allowed at all — same window as cancelling, so the two rules cannot drift.
export default function RescheduleButton({ appointment }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const now = useNow();
  const [open, setOpen] = useState(false);

  const hoursAway =
    (fromLocalDateTime(appointment.appointmentTime).getTime() - now) / 3_600_000;

  if (appointment.status !== 'CONFIRMED' || hoursAway <= 0) return null;

  const tooLate = user?.role !== 'STAFF' && hoursAway < CHANGE_WINDOW_HOURS;

  const go = () => {
    if (tooLate) {
      setOpen(true);
      return;
    }
    navigate(
      `/doctors/${appointment.doctorId}/calendar?reschedule=${appointment.appointmentId}`,
    );
  };

  return (
    <>
      <Button size="sm" variant="secondary" onClick={go}>
        {t('appointments.reschedule.action')}
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={t('appointments.cancel.lateTitle', { hours: CHANGE_WINDOW_HOURS })}
        description={t('appointments.reschedule.lateText', { hours: CHANGE_WINDOW_HOURS })}
        footer={
          <Button variant="secondary" onClick={() => setOpen(false)}>
            {t('appointments.cancel.close')}
          </Button>
        }
      >
        <p>
          <Trans
            i18nKey="appointments.cancel.lateCall"
            values={{ phone: CLINIC.phone }}
            components={{ mono: <span style={mono} /> }}
          />
        </p>
      </Dialog>
    </>
  );
}
