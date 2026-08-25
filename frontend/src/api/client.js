// Every request goes through here: one place for the base URL and for errors.
//
// Paths are relative (`/api/...`) and go through the Vite proxy, so the browser
// talks to its own origin and CORS never comes into play. `VITE_API_URL` points
// it elsewhere without touching the code.

import { readToken } from '../lib/token';

const BASE = import.meta.env.VITE_API_URL ?? '/api';

// The backend returns plain text for errors, so callers branch on `status`.
// Each caller knows which endpoint it hit: 409 means "slot taken" when booking
// and "email taken" when registering. `message` is for diagnostics only — the
// UI translates by status, it never shows the server text.
export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// A 401 outside the auth endpoints means the token died on the server — expired,
// or signed with a secret the server no longer uses. Someone has to end the
// session; `SessionWatcher` registers here so this file stays free of React.
let onUnauthorized = null;
export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

export async function request(path, options = {}) {
  // Read on every call rather than at import time: the token changes when the
  // patient signs in or out, and localStorage is the single source of truth.
  const token = readToken();

  const response = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    // Wrong password is also a 401 — that one belongs to the login form, not here.
    if (response.status === 401 && !path.startsWith('/auth/')) onUnauthorized?.();
    throw new ApiError(response.status, (await response.text()) || response.statusText);
  }

  return response.status === 204 ? null : response.json();
}
