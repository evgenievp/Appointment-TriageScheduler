import { request } from './client';

// GET /api/patients/me → UserDto { id, name, phone, email }
// Behind hasRole("PATIENT"): staff and doctors get 403, even though they too
// are rows in `users`. Callers fall back to the email from the token.
export const getMe = () => request('/patients/me');
