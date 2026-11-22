// Mode demo: data contoh di dalam aplikasi, tanpa backend dan tanpa internet.
// Aktifkan dengan EXPO_PUBLIC_USE_MOCK=true di .env (lalu `npx expo start -c`).
import { ApiError } from './client';

const wait = (ms = 250) => new Promise((r) => setTimeout(r, ms));

// Batas harian contoh (garam_g = natrium_mg x 2,5 / 1000, jadi 3 g = 1.200 mg natrium).
const limitsFor = (age) => {
  const f = age <= 6 ? 0.8 : age <= 9 ? 1 : 1.2;
  return { gula_g: Math.round(25 * f), garam_g: Math.round(3 * f * 10) / 10, lemak_g: Math.round(45 * f) };
};

const LABEL = { A: 'Sangat baik', B: 'Baik', C: 'Hati-hati', D: 'Batasi' };
const SARAN = {
  A: 'Pilihan yang baik.',
  B: 'Pilihan yang cukup baik.',
  C: 'Konsumsi dengan bijak dan pertimbangkan alternatif yang lebih rendah.',
  D: 'Sebaiknya dibatasi.',
};

const catalog = {
  p1: { id: 'p1', nama: 'Biskuit Cokelat', level: 'C', nutrisi: { takaran_saji: 40, satuan_takaran: 'g', gula_g: 12, natrium_mg: 180, lemak_g: 7 } },
  p2: { id: 'p2', nama: 'Susu Cokelat Kotak', level: 'B', nutrisi: { takaran_saji: 200, satuan_takaran: 'ml', gula_g: 9, natrium_mg: 240, lemak_g: 11 } },
  p3: { id: 'p3', nama: 'Yogurt Plain Cup', level: 'A', nutrisi: { takaran_saji: 100, satuan_takaran: 'g', gula_g: 4, natrium_mg: 60, lemak_g: 3 } },
  p4: { id: 'p4', nama: 'Keripik Kentang', level: 'D', nutrisi: { takaran_saji: 30, satuan_takaran: 'g', gula_g: 1, natrium_mg: 200, lemak_g: 10 } },
  p5: { id: 'p5', nama: 'Roti Isi Cokelat', level: 'C', nutrisi: { takaran_saji: 60, satuan_takaran: 'g', gula_g: 11, natrium_mg: 210, lemak_g: 8 } },
};
const barcodes = { '8999999000011': 'p1', '8999999000028': 'p2', '8999999000035': 'p3' };

const ggl = (n, servings) => ({
  gula_g: n.gula_g * servings,
  garam_g: (n.natrium_mg * servings) / 400,
  lemak_g: n.lemak_g * servings,
});

const levelFor = (n, limits) => {
  const g = ggl(n, 1);
  const r = Math.max(g.gula_g / limits.gula_g, g.garam_g / limits.garam_g, g.lemak_g / limits.lemak_g);
  return r < 0.15 ? 'A' : r < 0.3 ? 'B' : r < 0.5 ? 'C' : 'D';
};

const state = { kids: [], consumptions: [], seq: 100 };

const ago = (days, h, m) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

const seed = () => {
  state.kids = [
    { id: 'c1', name: 'Aisyah', age: 8 },
    { id: 'c2', name: 'Raka', age: 5 },
  ];
  const rows = [
    ['p2', 0, 10, 20], ['p1', 0, 8, 45],
    ['p4', 1, 16, 45], ['p5', 1, 13, 30], ['p3', 1, 9, 5],
  ];
  state.consumptions = rows.map(([pid, days, h, m], i) => ({
    id: `k${i}`, child_id: 'c1', product_id: pid, jumlah_sajian: 1, waktu_konsumsi: ago(days, h, m),
  }));
};
seed();

const wibDay = (iso) => new Date(Date.parse(iso) + 7 * 3600 * 1000).toISOString().slice(0, 10);

const toItem = (c) => {
  const p = catalog[c.product_id];
  return {
    ...c,
    ggl: ggl(p.nutrisi, c.jumlah_sajian),
    produk: { id: p.id, nama: p.nama, nutrisi: p.nutrisi },
    nutri_level: p.level,
  };
};

const assessmentFor = (n, servings, child, produk) => {
  const limits = limitsFor(child.age);
  const level = levelFor(n, limits);
  const one = ggl(n, 1);
  return {
    produk,
    nutri_level: level,
    penanda: { level, label: LABEL[level] },
    ringkasan: `Perkiraan untuk ${child.name}. ${SARAN[level]}`,
    ggl_per_sajian: one,
    dampak_jatah_harian: {
      gula_g: (one.gula_g * servings / limits.gula_g) * 100,
      garam_g: (one.garam_g * servings / limits.garam_g) * 100,
      lemak_g: (one.lemak_g * servings / limits.lemak_g) * 100,
    },
  };
};

// ---------- API palsu (bentuk sama dengan cekjajan.js) ----------

export const apiRegister = async () => { await wait(); return { role: 'orang_tua' }; };

export const apiLogin = async (email) => {
  await wait();
  const nama = email.split('@')[0].replace(/[._]/g, ' ');
  return { token: 'mock-token', user: { nama: nama.charAt(0).toUpperCase() + nama.slice(1), email } };
};

export const apiListChildren = async () => { await wait(100); return [...state.kids]; };

export const apiCreateChild = async (token, name, age) => {
  await wait();
  const kid = { id: `c${++state.seq}`, name, age };
  state.kids.push(kid);
  return kid;
};

export const apiDailyQuota = async (token, childId) => {
  await wait(100);
  const kid = state.kids.find((k) => k.id === childId);
  const batas = limitsFor(kid.age);
  const terpakai = { gula_g: 0, garam_g: 0, lemak_g: 0 };
  const today = wibDay(new Date().toISOString());
  state.consumptions
    .filter((c) => c.child_id === childId && wibDay(c.waktu_konsumsi) === today)
    .forEach((c) => {
      const g = toItem(c).ggl;
      Object.keys(terpakai).forEach((k) => { terpakai[k] += g[k]; });
    });
  return { batas, terpakai };
};

export const apiListConsumptions = async (token, childId, date) => {
  await wait(100);
  return state.consumptions
    .filter((c) => c.child_id === childId && wibDay(c.waktu_konsumsi) === date)
    .map(toItem);
};

export const apiCreateProduct = async (token, product) => {
  await wait();
  const id = `p${++state.seq}`;
  catalog[id] = { id, nama: product.nama, level: 'C', nutrisi: product.nutrisi };
  return { id, nama: product.nama, nutrisi: product.nutrisi };
};

export const apiAssess = async (token, body) => {
  await wait(400);
  const child = state.kids.find((k) => k.id === body.child_id);
  if (body.barcode) {
    const p = catalog[barcodes[body.barcode]];
    if (!p) throw new ApiError(404, 'not_found', 'Produk dengan barcode ini tidak ditemukan.');
    const a = assessmentFor(p.nutrisi, body.jumlah_sajian, child, { id: p.id, nama: p.nama, nutrisi: p.nutrisi });
    return { ...a, nutri_level: p.level, penanda: { level: p.level, label: LABEL[p.level] } };
  }
  return assessmentFor(body.nutrisi, body.jumlah_sajian, child, null);
};

export const apiCreateConsumption = async (token, childId, productId, servings) => {
  await wait();
  state.consumptions.push({
    id: `k${++state.seq}`, child_id: childId, product_id: productId,
    jumlah_sajian: servings, waktu_konsumsi: new Date().toISOString(),
  });
  return { ok: true };
};
