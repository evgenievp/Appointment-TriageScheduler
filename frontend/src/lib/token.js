const STORAGE_KEY = 'auth_token';

// The token goes to localStorage when the patient asks to be remembered and to
// sessionStorage otherwise, so a clinic computer forgets them when the tab closes.
// Accepted trade-off either way: both are readable by any script on the page.

export function decodeToken(token) {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

const isExpired = (token) => {
  const exp = decodeToken(token)?.exp;
  return !exp || exp * 1000 <= Date.now();
};

// An expired token counts as no token, so the UI never pretends to be signed in.
export function readToken() {
  const token = sessionStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(STORAGE_KEY);
  return token && !isExpired(token) ? token : null;
}

export function saveToken(token, remember = true) {
  clearToken();
  (remember ? localStorage : sessionStorage).setItem(STORAGE_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
}

export function readUser() {
  const token = readToken();
  if (!token) return null;
  const payload = decodeToken(token);
  return payload && { email: payload.sub, role: payload.role };
}

export { STORAGE_KEY };
