import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { setUnauthorizedHandler } from '../api/client';
import { useAuth } from '../lib/authContext';
import { decodeToken, readToken } from '../lib/token';
import { useToast } from '../lib/toastContext';

// Ends the session when the token dies — either because the server rejected it
// or because it ran out while the tab was open. Renders nothing.
export default function SessionWatcher() {
  const { user, signOut } = useAuth();
  const showToast = useToast();
  const { t } = useTranslation();

  const expire = () => {
    signOut();
    showToast({
      tone: 'danger',
      title: t('auth.sessionExpired.title'),
      message: t('auth.sessionExpired.message'),
    });
  };

  useEffect(() => {
    setUnauthorizedHandler(() => {
      // Read the token instead of the auth state: several requests can fail at
      // once, and only the first one should end the session and say so.
      if (!readToken()) return;
      expire();
    });
    return () => setUnauthorizedHandler(null);
  });

  // Without this the header keeps showing a signed-in session until the next
  // request fails — and a page that fetches nothing never finds out at all.
  useEffect(() => {
    if (!user) return undefined;
    const exp = decodeToken(readToken() ?? '')?.exp;
    if (!exp) return undefined;

    const timer = setTimeout(expire, Math.max(0, exp * 1000 - Date.now()));
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return null;
}
