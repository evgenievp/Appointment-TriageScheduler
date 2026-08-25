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
