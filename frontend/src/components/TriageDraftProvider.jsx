import { useCallback, useMemo, useState } from 'react';
import { TriageDraftContext } from '../lib/triageDraft';
import { useAuth } from '../lib/authContext';

function Draft({ children }) {
  const [answers, setAnswers] = useState(null);
  const clear = useCallback(() => setAnswers(null), []);
  const value = useMemo(() => ({ answers, setAnswers, clear }), [answers, clear]);

  return (
    <TriageDraftContext.Provider value={value}>{children}</TriageDraftContext.Provider>
  );
}

// Чужди отговори не бива да чакат следващия човек на общия компютър, затова
// смяната на профил трябва да ги изтрие. Това става с `key`, а не с ефект:
// нулиране на състояние в `useEffect` е точно шаблонът, който React вече не
// позволява. При различна самоличност `Draft` се пресъздава и започва празен.
export default function TriageDraftProvider({ children }) {
  const { user } = useAuth();

  return <Draft key={user?.email ?? 'anon'}>{children}</Draft>;
}
