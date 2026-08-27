import { useNavigate, useSearchParams } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import PageShell from '../components/PageShell';
import TriageForm from '../components/triage/TriageForm';
import BookingSteps from '../components/triage/BookingSteps';
import useBookWithTriage from '../components/triage/useBookWithTriage';
import { useTriageDraft } from '../lib/triageDraft';
import { formatDayLong, fromLocalDateTime } from '../lib/dates';

const mono = { fontFamily: 'var(--font-mono)', fontWeight: 'var(--fw-mono)' };

// Първата стъпка от записването. Въпросите идват преди избора на час, защото
// така обещава и началната страница („01 Отговаряте на въпросите“), и защото
// иначе изборът на час създава усещане за край, след което изникват още четири
// въпроса.
//
// Страницата има два входа:
//
//   без `?slot=`  — редовният път от „Запазете час“. След отговорите пращаме към
//                   списъка с лекари и часът се избира оттам нататък.
//   с `?slot=`    — човекът е стигнал до календар без попълнен триаж, избрал е
//                   час и е натиснал „Запазете часа“. Намерението му е ясно,
//                   затова след последния въпрос записваме направо, вместо да го
//                   връщаме да натисне същия бутон втори път.
export default function Triage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { answers, setAnswers } = useTriageDraft();

  const from = params.get('from');
  const back = from?.startsWith('/') && !from.startsWith('//') ? from : '/doctors';

  // Боклук в адреса се държи като липсващ слот — тогава просто връщаме назад.
  const slotId = Number(params.get('slot'));
  const slot = Number.isInteger(slotId) && slotId > 0 ? slotId : null;

  const at = params.get('at');
  const when =
    slot && at && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(at)
      ? `${formatDayLong(fromLocalDateTime(at), i18n.resolvedLanguage)}, ${at.slice(11, 16)}`
      : null;

  const { mutate: book, isPending } = useBookWithTriage({
    // Часът е грабнат, докато човекът е отговарял. Връщаме го на грида на същия
    // лекар — без `?slot=`, за да не се пресели избор върху зает час. Отговорите
    // остават в черновата, тоест втори опит е един клик.
    onConflict: () => navigate(back),
  });

  const done = (given) => {
    setAnswers(given);
    if (slot) book({ slot: { id: slot }, answers: given });
    else navigate(back);
  };

  return (
    <PageShell active="booking">
      <div style={{ maxWidth: 'var(--measure)' }}>
        <BookingSteps current={0} />

        <h1 style={{ marginTop: 'var(--space-8)' }}>{t('triage.page.title')}</h1>
        <p
          style={{
            color: 'var(--text-muted)',
            marginTop: 'var(--space-3)',
            marginBottom: 'var(--space-8)',
            maxWidth: 'var(--measure-prose)',
          }}
        >
          {when ? (
            <Trans
              i18nKey="triage.page.leadWithSlot"
              values={{ when }}
              components={{ mono: <span style={mono} /> }}
            />
          ) : (
            t('triage.page.lead')
          )}
        </p>

        <TriageForm
          value={answers}
          onChange={setAnswers}
          busy={isPending}
          submitLabel={t(slot ? 'triage.page.submitAndBook' : 'triage.page.submit')}
          onSubmit={done}
        />
      </div>
    </PageShell>
  );
}
