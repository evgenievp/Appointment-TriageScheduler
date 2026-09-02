import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rescheduleAppointment } from '../../api/appointments';
import { useAuth } from '../../lib/authContext';
import { useToast } from '../../lib/toastContext';

// Moving a visit is one PATCH: the appointment keeps its id, so the triage and
// the priority come along and there is nothing to copy or re-answer. What is
// left for the client is the same conflict handling as booking has.
export default function useReschedule({ onConflict } = {}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const showToast = useToast();
  const { user } = useAuth();
  // Reception lands back on its board; a moved visit is not in its own list.
  const home = user?.role === 'STAFF' ? '/staff' : '/me/appointments';

  return useMutation({
    mutationFn: ({ appointmentId, slot }) => rescheduleAppointment(appointmentId, slot.id),

    onSuccess: (appointment, { slot }) => {
      queryClient.invalidateQueries({ queryKey: ['slots'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });

      // The server answer is the source of truth; the picked slot is the
      // fallback should an older backend return nothing.
      const at = appointment?.appointmentTime ?? slot.startTime;
      showToast({
        tone: 'success',
        title: t('calendar.reschedule.doneTitle'),
        message: t('calendar.reschedule.doneMessage', { time: at.slice(11, 16) }),
      });
      navigate(home);
    },

    onError: (error) => {
      if (error.status === 409) {
        showToast({
          tone: 'danger',
          title: t('calendar.takenTitle'),
          message: t('calendar.takenMessage'),
        });
        queryClient.invalidateQueries({ queryKey: ['slots'] });
        onConflict?.();
        return;
      }
      if (error.status === 403) {
        showToast({
          tone: 'danger',
          title: t('calendar.reschedule.forbiddenTitle'),
          message: t('calendar.reschedule.forbiddenMessage'),
        });
        return;
      }
      showToast({
        tone: 'danger',
        title: t('calendar.reschedule.failedTitle'),
        message: t('calendar.reschedule.failedMessage'),
      });
      onConflict?.();
    },
  });
}
