import {
  CEKJAJAN_BASE_URL,
  JEJAKTUMBUH_BASE_URL,
  REQUEST_TIMEOUT_MS,
  CACHE_TTL_MS,
} from '../config';

/* ------------------------------------------------------------------ */
/* Error yang seragam, supaya layar cukup menampilkan error.message     */
/* ------------------------------------------------------------------ */
export class ApiError extends Error {
  // type: 'timeout' | 'network' | 'parse' | 'http'
  constructor(type, message, status = null, details = null) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.status = status;
    this.details = details;
  }
}

const DEFAULT_MESSAGES = {
  timeout: 'Server terlalu lama merespons. Coba lagi sebentar lagi.',
  network: 'Tidak bisa terhubung ke server. Periksa koneksi internet kamu.',
  parse: 'Respons server tidak bisa dibaca.',
  400: 'Data yang dikirim tidak valid.',
  401: 'Sesi berakhir atau data login salah. Silakan login lagi.',
  403: 'Kamu tidak berhak mengakses data ini.',
  404: 'Data tidak ditemukan.',
  429: 'Terlalu sering memanggil. Coba lagi beberapa saat lagi.',
};

function httpMessage(status, body) {
  // Kontrak CekJajan: { error: { code, message } }. Pesan server dipakai bila ada.
  const fromServer = body && body.error && body.error.message;
  if (fromServer) return fromServer;
  if (DEFAULT_MESSAGES[status]) return DEFAULT_MESSAGES[status];
  if (status >= 500) return 'Server sedang bermasalah. Coba lagi nanti.';
  return `Permintaan gagal (kode ${status}).`;
}

/* ------------------------------------------------------------------ */
/* Fungsi dasar: satu-satunya tempat yang memanggil fetch               */
/* ------------------------------------------------------------------ */
function buildUrl(baseUrl, path, query) {
  const base = baseUrl.replace(/\/+$/, '');
  const pairs = Object.entries(query || {})
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
  return `${base}${path}${pairs.length ? `?${pairs.join('&')}` : ''}`;
}

export async function request(
  baseUrl,
  path,
  { method = 'GET', query, body, token, headers: extra, timeoutMs = REQUEST_TIMEOUT_MS } = {}
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const headers = { Accept: 'application/json', ...extra };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    let res;
    try {
      res = await fetch(buildUrl(baseUrl, path, query), {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
    } catch (e) {
      const type = e && e.name === 'AbortError' ? 'timeout' : 'network';
      throw new ApiError(type, DEFAULT_MESSAGES[type]);
    }

    const text = await res.text();
    let data = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (e) {
        if (res.ok) throw new ApiError('parse', DEFAULT_MESSAGES.parse, res.status);
      }
    }
    if (!res.ok) throw new ApiError('http', httpMessage(res.status, data), res.status, data);
    return data;
  } finally {
    clearTimeout(timer);
  }
}

/* ------------------------------------------------------------------ */
/* API CekJajan (kelompok sendiri) - sesuai openapi.yaml                */
/* ------------------------------------------------------------------ */
let authToken = null;
let onUnauthorized = null;

// Dipanggil dari AuthContext: simpan/hapus token setelah login/logout/restore sesi.
export function setAuthToken(token) {
  authToken = token || null;
}
// Dipanggil bila server membalas 401 saat sedang login (mis. token kedaluwarsa).
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn || null;
}

async function cj(path, opts = {}) {
  try {
    return await request(CEKJAJAN_BASE_URL, path, { token: authToken, ...opts });
  } catch (e) {
    if (e instanceof ApiError && e.status === 401 && authToken && onUnauthorized) onUnauthorized();
    throw e;
  }
}

export const CekJajanApi = {
  // Publik
  health: () => cj('/health'),
  quickAssessment: ({ takaran_saji, satuan_takaran, gula_g, natrium_mg, lemak_g }) =>
    cj('/assessments/quick', {
      query: { takaran_saji, satuan_takaran, gula_g, natrium_mg, lemak_g },
    }),

  // Auth
  register: ({ nama, email, password }) =>
    cj('/auth/register', { method: 'POST', body: { nama, email, password } }),
  login: async (email, password) => {
    const result = await cj('/auth/login', { method: 'POST', body: { email, password } });
    setAuthToken(result.token);
    return result; // { token, token_type, expires_in, user }
  },
  logout: () => setAuthToken(null),
  me: () => cj('/auth/me'),

  // Produk & penilaian
  getProductByBarcode: (barcode) => cj(`/products/${encodeURIComponent(barcode)}`),
  createProduct: (product) => cj('/products', { method: 'POST', body: product }),
  assess: ({ barcode, nutrisi, jumlah_sajian, child_id }) =>
    cj('/assessments', {
      method: 'POST',
      body: { barcode, nutrisi, jumlah_sajian, child_id }, // isi salah satu: barcode atau nutrisi
    }),

  // Anak & jatah harian
  getChildren: () => cj('/children'),
  createChild: ({ nama_panggilan, usia_tahun }) =>
    cj('/children', { method: 'POST', body: { nama_panggilan, usia_tahun } }),
  getChild: (childId) => cj(`/children/${encodeURIComponent(childId)}`),
  getDailyQuota: (childId, date) =>
    cj(`/children/${encodeURIComponent(childId)}/daily-quota`, { query: { date } }),
  getConsumptions: (childId, date) =>
    cj(`/children/${encodeURIComponent(childId)}/consumptions`, { query: { date } }),
  addConsumption: (childId, { product_id, jumlah_sajian, waktu_konsumsi }) =>
    cj(`/children/${encodeURIComponent(childId)}/consumptions`, {
      method: 'POST',
      body: { product_id, jumlah_sajian, waktu_konsumsi },
    }),
};

/* ------------------------------------------------------------------ */
/* API kelompok lain: tidak boleh membuat aplikasi crash                */
/* Selalu mengembalikan { ok, data, fromCache, savedAt, error }.        */
/* Bila API mati, data terakhir dari cache dipakai (kalau ada).         */
/* ------------------------------------------------------------------ */
const partnerCache = new Map();

// Bentuk respons kelompok lain belum dipastikan: terima array langsung
// atau objek berisi data/items/results.
export function toList(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object') {
    for (const key of ['data', 'items', 'results']) {
      if (Array.isArray(payload[key])) return payload[key];
    }
  }
  return [];
}

// Info halaman bila API kelompok lain memakai format daftar PocketBase.
function toMeta(payload) {
  if (!payload || Array.isArray(payload) || typeof payload !== 'object') return null;
  const { page, perPage, totalItems, totalPages } = payload;
  return totalItems === undefined ? null : { page, perPage, totalItems, totalPages };
}

async function partnerGet(baseUrl, path, query, mapItem = (x) => x) {
  const key = `${baseUrl}${path}?${JSON.stringify(query || {})}`;
  try {
    const raw = await request(baseUrl, path, { query });
    const data = toList(raw).map(mapItem);
    const meta = toMeta(raw);
    const savedAt = Date.now();
    partnerCache.set(key, { data, meta, savedAt });
    return { ok: true, data, meta, fromCache: false, savedAt, error: null };
  } catch (error) {
    const hit = partnerCache.get(key);
    if (hit) {
      return {
        ok: true,
        data: hit.data,
        meta: hit.meta,
        fromCache: true,
        savedAt: hit.savedAt,
        stale: Date.now() - hit.savedAt > CACHE_TTL_MS,
        error,
      };
    }
    return { ok: false, data: [], meta: null, fromCache: false, savedAt: null, error };
  }
}

// Tanggal PocketBase berbentuk "2026-11-21 05:26:07.116Z" (spasi, bukan "T").
// Format itu bisa dianggap tidak valid oleh Hermes di Android, jadi dinormalkan ke ISO 8601.
function toIsoDate(value) {
  return typeof value === 'string' ? value.replace(' ', 'T') : value;
}

// Bentuk artikel yang dipakai aplikasi (dari field respons JejakTumbuh).
// category: 'gizi' | 'tumbuh_kembang' | 'gigi'
export function mapArticle(a) {
  return {
    id: a.id,
    title: a.title,
    summary: a.summary,
    content: a.content,
    category: a.category,
    source: a.source, // rujukan artikel, tampilkan di layar agar jelas asal informasinya
    createdAt: toIsoDate(a.created),
    updatedAt: toIsoDate(a.updated),
  };
}

// Kelompok AHAY (JejakTumbuh): artikel gizi/tumbuh kembang & daftar fasilitas kesehatan anak.
export const JejakTumbuhApi = {
  getArticles: (query) => partnerGet(JEJAKTUMBUH_BASE_URL, '/articles', query, mapArticle),
  // Bentuk respons /facilities belum dipastikan, jadi dikembalikan apa adanya.
  getFacilities: (query) => partnerGet(JEJAKTUMBUH_BASE_URL, '/facilities', query),
};

// Penyaring di sisi aplikasi (cache tetap utuh): mis. kategori 'gizi' untuk layar hasil penilaian.
export function filterArticlesByCategory(articles, category) {
  return category ? articles.filter((a) => a.category === category) : articles;
}

// Hanya untuk pengujian: kosongkan cache antar tes.
export function __clearPartnerCache() {
  partnerCache.clear();
}
