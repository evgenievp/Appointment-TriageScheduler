// Тънък fetch слой. Всички заявки минават оттук, за да има едно място за
// базовия адрес и за формата на грешките.
//
// По подразбиране пътищата са относителни (`/api/...`) и минават през proxy-то
// на Vite — така браузърът говори със собствения си адрес и CORS не влиза в
// играта. `VITE_API_URL` позволява да се насочи другаде без промяна в кода.

const BASE = import.meta.env.VITE_API_URL ?? '/api';

// Договореният формат на грешките от бекенда: { code, message }.
export const SLOT_TAKEN = 'SLOT_TAKEN';

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export async function request(path, options = {}) {
  const response = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  if (!response.ok) {
    let body = null;
    try {
      body = await response.json();
    } catch {
      // празно или нечетимо тяло — оставаме с кода на статуса
    }
    throw new ApiError(
      response.status,
      body?.code ?? 'UNKNOWN',
      body?.message ?? response.statusText,
    );
  }

  return response.status === 204 ? null : response.json();
}
