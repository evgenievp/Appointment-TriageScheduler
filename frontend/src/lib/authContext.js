import { createContext, useContext } from 'react';

// Kept apart from the provider so one file does not export both a component and
// a hook — react-refresh loses state otherwise.
export const AuthContext = createContext(null);

/** { user, isAuthenticated, signIn, signOut } */
export const useAuth = () => useContext(AuthContext);
