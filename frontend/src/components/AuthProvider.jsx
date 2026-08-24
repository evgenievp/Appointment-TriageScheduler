import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '../lib/authContext';
import { STORAGE_KEY, clearToken, readUser, saveToken } from '../lib/token';

export default function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(readUser);

  const signIn = useCallback((token) => {
    saveToken(token);
    setUser(readUser());
  }, []);

  const signOut = useCallback(() => {
    clearToken();
    setUser(null);
    // Otherwise the next patient on this browser sees the previous one's data.
    queryClient.clear();
  }, [queryClient]);

  // Signing out in one tab must not leave another tab looking signed in.
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === STORAGE_KEY) setUser(readUser());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), signIn, signOut }),
    [user, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
