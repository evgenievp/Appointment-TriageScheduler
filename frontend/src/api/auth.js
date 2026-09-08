import { request } from './client';

// POST /api/auth/register  { email, password, name, phone } → UserDto
//   409, ако имейлът вече е зает
// POST /api/auth/login     { email, password } → { token }
//   401 при грешни данни
//
// Внимание: бекендът приема само тези четири полета. Дизайнът на регистрацията
// иска доста повече (ЕГН, град, здравен фонд…) — разликата е за уточняване с екипа.

export const register = (data) =>
  request('/auth/register', { method: 'POST', body: JSON.stringify(data) });

export const login = (credentials) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });

// POST /api/emails/forgot-password?email=… → 200, no body.
// Always 200 by contract, whether or not the address has an account: a "no
// such user" here would tell strangers who is a patient of the clinic.
// The link in the mail is /reset-password?token=…&email=… and lives 15 minutes.
export const forgotPassword = (email) =>
  request(`/emails/forgot-password?email=${encodeURIComponent(email)}`, { method: 'POST' });

// POST /api/emails/reset-password { email, token, newPassword } → 200
//   400 when the token is wrong or expired
export const resetPassword = (data) =>
  request('/emails/reset-password', { method: 'POST', body: JSON.stringify(data) });
