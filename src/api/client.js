import { API_BASE_URL, REQUEST_TIMEOUT_MS } from '../config';

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status; // 0 = gagal terhubung
    this.code = code;
  }
}

const buildQuery = (query) => {
  if (!query) return '';
  const parts = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
  return parts.length ? `?${parts.join('&')}` : '';
};

// Semua error backend berbentuk { error: { code, message } } (lihat openapi.yaml).
export async function request(path, { method = 'GET', body, token, query } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}${buildQuery(query)}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (e) {
    throw new ApiError(0, 'network', 'Tidak bisa terhubung ke server. Periksa koneksi internetmu.');
  } finally {
    clearTimeout(timer);
  }

  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }

  if (!res.ok) {
    const fallback =
      res.status === 429
        ? 'Terlalu sering mencoba. Tunggu sebentar lalu coba lagi.'
        : 'Terjadi kesalahan pada server.';
    throw new ApiError(res.status, data?.error?.code ?? 'http_error', data?.error?.message ?? fallback);
  }

  return data;
}
