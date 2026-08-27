import { createContext, useContext } from 'react';

// Отговорите от триажа между страниците. Нарочно само в паметта: това са здравни
// данни и нямат работа нито в браузърното хранилище, нито в базата, преди да има
// резервация, към която да се закачат.
//
// Целият поток — въпроси → лекари → календар → записване — минава без
// презареждане, така че контекстът стига. При F5 отговорите отпадат и се дават
// наново; това е цената да не остават следи.
export const TriageDraftContext = createContext(null);

/** { answers, setAnswers, clear } */
export const useTriageDraft = () => useContext(TriageDraftContext);
