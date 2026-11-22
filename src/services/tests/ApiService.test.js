import {
  ApiError,
  CekJajanApi,
  JejakTumbuhApi,
  filterArticlesByCategory,
  mapArticle,
  request,
  setAuthToken,
  setUnauthorizedHandler,
  toList,
  __clearPartnerCache,
} from '../ApiService';

const ok = (body, status = 200) => ({ ok: true, status, text: async () => JSON.stringify(body) });
const fail = (status, body) => ({ ok: false, status, text: async () => JSON.stringify(body || {}) });

beforeEach(() => {
  global.fetch = jest.fn();
  setAuthToken(null);
  setUnauthorizedHandler(null);
  __clearPartnerCache();
});

describe('CekJajanApi', () => {
  test('quickAssessment mengirim query yang benar dan mengembalikan JSON', async () => {
    global.fetch.mockResolvedValue(ok({ nutri_level: 'C' }));
    const res = await CekJajanApi.quickAssessment({
      takaran_saji: 200, satuan_takaran: 'ml', gula_g: 15, natrium_mg: 30, lemak_g: 0,
    });
    expect(res.nutri_level).toBe('C');
    const [url, opts] = global.fetch.mock.calls[0];
    expect(url).toContain('/assessments/quick?takaran_saji=200&satuan_takaran=ml&gula_g=15&natrium_mg=30&lemak_g=0');
    expect(opts.method).toBe('GET');
  });

  test('login menyimpan token dan request berikutnya membawa header Authorization', async () => {
    global.fetch.mockResolvedValueOnce(ok({ token: 'abc123', user: { id: 'usr-001' } }));
    await CekJajanApi.login('ortu.uji@example.com', 'PasswordContoh123');
    global.fetch.mockResolvedValueOnce(ok({ items: [] }));
    await CekJajanApi.getChildren();
    expect(global.fetch.mock.calls[1][1].headers.Authorization).toBe('Bearer abc123');
  });

  test('404 menjadi ApiError bertipe http dengan pesan dari server', async () => {
    global.fetch.mockResolvedValue(
      fail(404, { error: { code: 'not_found', message: 'Produk dengan barcode ini tidak ditemukan.' } })
    );
    await expect(CekJajanApi.getProductByBarcode('8999999000000')).rejects.toMatchObject({
      type: 'http', status: 404, message: 'Produk dengan barcode ini tidak ditemukan.',
    });
  });

  test('401 saat sedang login memanggil unauthorized handler', async () => {
    const handler = jest.fn();
    setUnauthorizedHandler(handler);
    setAuthToken('kedaluwarsa');
    global.fetch.mockResolvedValue(fail(401, { error: { message: 'Token salah.' } }));
    await expect(CekJajanApi.me()).rejects.toBeInstanceOf(ApiError);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  test('gagal jaringan menjadi ApiError bertipe network', async () => {
    global.fetch.mockRejectedValue(new TypeError('Network request failed'));
    await expect(CekJajanApi.health()).rejects.toMatchObject({ type: 'network' });
  });

  test('server lambat menjadi ApiError bertipe timeout', async () => {
    global.fetch.mockImplementation(
      (url, { signal }) =>
        new Promise((resolve, reject) => {
          signal.addEventListener('abort', () => {
            const e = new Error('aborted');
            e.name = 'AbortError';
            reject(e);
          });
        })
    );
    await expect(request('https://contoh.test/api', '/health', { timeoutMs: 20 })).rejects.toMatchObject({
      type: 'timeout',
    });
  });

  test('respons sukses yang bukan JSON menjadi error parse', async () => {
    global.fetch.mockResolvedValue({ ok: true, status: 200, text: async () => '<html>oops</html>' });
    await expect(CekJajanApi.health()).rejects.toMatchObject({ type: 'parse' });
  });
});

// Bentuk respons asli GET /articles dari kelompok AHAY (daftar PocketBase), dipersingkat.
const AHAY_ARTICLES = {
  items: [
    { id: 'a1', category: 'gizi', title: 'Mengenal Stunting dan Cara Mencegahnya', summary: 'Ringkasan.', content: 'Isi.', source: 'WHO; Kemenkes', created: '2026-11-21 05:26:07.117Z', updated: '2026-11-21 05:26:07.117Z', collectionId: 'pbc_4287850865', collectionName: 'articles' },
    { id: 'a2', category: 'gigi', title: 'Merawat Gigi Susu', summary: 'Ringkasan.', content: 'Isi.', source: 'IDAI', created: '2026-11-21 05:26:07.121Z', updated: '2026-11-21 05:26:07.121Z', collectionId: 'pbc_4287850865', collectionName: 'articles' },
  ],
  page: 1, perPage: 30, totalItems: 2, totalPages: 1,
};

describe('JejakTumbuhApi (API kelompok lain)', () => {
  test('getArticles memetakan respons asli AHAY dan membawa info halaman', async () => {
    global.fetch.mockResolvedValue(ok(AHAY_ARTICLES));
    const res = await JejakTumbuhApi.getArticles();
    expect(res.ok).toBe(true);
    expect(res.meta).toEqual({ page: 1, perPage: 30, totalItems: 2, totalPages: 1 });
    expect(res.data[0]).toEqual({
      id: 'a1', title: 'Mengenal Stunting dan Cara Mencegahnya', summary: 'Ringkasan.', content: 'Isi.',
      category: 'gizi', source: 'WHO; Kemenkes',
      createdAt: '2026-11-21T05:26:07.117Z', updatedAt: '2026-11-21T05:26:07.117Z',
    });
    expect(Number.isNaN(new Date(res.data[0].createdAt).getTime())).toBe(false);
    expect(filterArticlesByCategory(res.data, 'gizi')).toHaveLength(1);
    expect(filterArticlesByCategory(res.data)).toHaveLength(2);
  });

  test('sukses: mengembalikan daftar dan menyimpan cache', async () => {
    global.fetch.mockResolvedValue(ok([{ id: 1, title: 'Gizi anak' }]));
    const res = await JejakTumbuhApi.getArticles();
    expect(res).toMatchObject({ ok: true, fromCache: false, error: null });
    expect(res.data).toHaveLength(1);
  });

  test('API mati tetapi ada cache: aplikasi tetap dapat data lama', async () => {
    global.fetch.mockResolvedValueOnce(ok({ data: [{ id: 1 }] }));
    await JejakTumbuhApi.getFacilities();
    global.fetch.mockRejectedValueOnce(new TypeError('Network request failed'));
    const res = await JejakTumbuhApi.getFacilities();
    expect(res).toMatchObject({ ok: true, fromCache: true });
    expect(res.data).toHaveLength(1);
    expect(res.error.type).toBe('network');
  });

  test('API mati dan tidak ada cache: tidak melempar error, ok = false', async () => {
    global.fetch.mockResolvedValue(fail(500));
    const res = await JejakTumbuhApi.getArticles();
    expect(res.ok).toBe(false);
    expect(res.data).toEqual([]);
    expect(res.error.message).toMatch(/bermasalah/);
  });

  test('toList menerima array, {data}, {items}, atau data kosong', () => {
    expect(toList([1])).toEqual([1]);
    expect(toList({ data: [2] })).toEqual([2]);
    expect(toList({ items: [3] })).toEqual([3]);
    expect(toList(null)).toEqual([]);
  });
});
