// Every request goes through here: one place for the base URL and for errors.
//
// Paths are relative (`/api/...`) and go through the Vite proxy, so the browser
// talks to its own origin and CORS never comes into play. `VITE_API_URL` points
// it elsewhere without touching the code.

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

export async function request(path, options = {}) {
  const response = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  if (!response.ok) {
    throw new ApiError(response.status, (await response.text()) || response.statusText);
  }

  return response.status === 204 ? null : response.json();
}
