import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bookSlot } from '../../api/appointments';
import { submitTriage } from '../../api/triage';
import { useAuth } from '../../lib/authContext';
import { useToast } from '../../lib/toastContext';
import { useTriageDraft } from '../../lib/triageDraft';

// Записване и триаж, в този ред: `submitTriage` иска appointmentId, тоест часът
// трябва да съществува преди въпросникът да има за какво да се закачи.
//
// Стои тук, а не в страницата, защото и календарът, и страницата с въпросите
// правят абсолютно същото. Единствената им разлика е какво следва при зает час,
// затова тя е параметър.
export default function useBookWithTriage({ onConflict } = {}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const showToast = useToast();
  const { clear: clearAnswers } = useTriageDraft();
  const { user } = useAuth();

  // Служителят минава по същия път, но краят му е различен: часът е записан на
  // него и оттук нататък се прехвърля на пациента, с когото говори по телефона.
  const isStaff = user?.role === 'STAFF';

  return useMutation({
    mutationFn: async ({ slot, answers }) => {
      const appointment = await bookSlot(slot.id);
      try {
        await submitTriage(appointment.appointmentId, answers);
        return { appointment, triaged: true };
      } catch {
        // Часът е запазен — това е важното. Въпросникът се допълва после.
        return { appointment, triaged: false };
      }
    },

    onSuccess: ({ appointment, triaged }) => {
      // Отговорите са свършили работа — нямат причина да живеят по-нататък.
      clearAnswers();
      queryClient.invalidateQueries({ queryKey: ['slots'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });

      const time = appointment.appointmentTime.slice(11, 16);

      showToast(
        !triaged
          ? {
              tone: 'warning',
              title: t('calendar.bookedNoTriageTitle'),
              message: t('calendar.bookedNoTriageMessage'),
            }
          : isStaff
            ? {
                tone: 'success',
                title: t('staffBooking.heldTitle'),
                message: t('staffBooking.heldMessage', { time }),
              }
            : {
                tone: 'success',
                title: t('calendar.bookedTitle'),
                // Часът идва от отговора, а не от подадения слот: календарът знае
                // времето, но страницата с въпросите има само id.
                message: t('calendar.bookedMessage', { time }),
              },
      );

      navigate(
        isStaff ? `/staff/assign/${appointment.appointmentId}` : '/me/appointments',
      );
    },

    onError: (error) => {
      // Someone took the slot between loading the grid and the click. The
      // answers stay in the draft, so picking another time costs nothing.
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
      showToast({
        tone: 'danger',
        title: t('calendar.failedTitle'),
        message: t('calendar.failedMessage'),
      });
      onConflict?.();
    },
  });
}
