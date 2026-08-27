import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageShell from '../components/PageShell';
import TriageForm from '../components/triage/TriageForm';
import BookingSteps from '../components/triage/BookingSteps';
import { useTriageDraft } from '../lib/triageDraft';

// Първата стъпка от записването. Въпросите идват преди избора на час, защото
// така обещава и началната страница („01 Отговаряте на въпросите“), и защото
// иначе изборът на час създава усещане за край, след което изникват още четири
// въпроса.
//
// Заявката към сървъра пак тръгва след записването — `submitTriage` иска
// appointmentId. Тук само събираме отговорите.
export default function Triage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { answers, setAnswers } = useTriageDraft();

  // Календарът праща насам, когато някой стигне до час без отговори. Връщаме го
  // на същото място и на същия час.
  const from = params.get('from');
  const back = from?.startsWith('/') && !from.startsWith('//') ? from : '/doctors';
  const slot = params.get('slot');

  const done = (given) => {
    setAnswers(given);
    navigate(slot ? `${back}?slot=${slot}` : back);
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
          {t('triage.page.lead')}
        </p>

        <TriageForm
          value={answers}
          onChange={setAnswers}
          submitLabel={t('triage.page.submit')}
          onSubmit={done}
        />
      </div>
    </PageShell>
  );
}
