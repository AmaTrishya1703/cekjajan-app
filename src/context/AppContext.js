import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { ApiError } from '../api/client';
import * as api from '../api/cekjajan';
import { HISTORY_DAYS } from '../config';

const AppContext = createContext(null);

const STALE_MS = 20000;

// Tanggal WIB (YYYY-MM-DD), `daysBack` hari sebelum hari ini. Backend memakai tanggal WIB.
const wibDate = (daysBack) =>
  new Date(Date.now() + 7 * 3600 * 1000 - daysBack * 86400000).toISOString().slice(0, 10);

const toEntry = (c) => ({
  id: c.id,
  productId: c.product_id,
  servings: c.jumlah_sajian,
  at: Date.parse(c.waktu_konsumsi),
  ggl: c.ggl,
  produk: c.produk ?? null, // ada bila backend sudah memuat patch "konsumsi + produk"
  level: c.nutri_level ?? null,
});

export function AppProvider({ children }) {
  const [session, setSession] = useState(null); // { token, user }
  const [kids, setKids] = useState([]);
  const [activeChildId, setActiveChildId] = useState(null);
  const [quota, setQuota] = useState(null);
  const [history, setHistory] = useState([]);
  const [productCache, setProductCache] = useState({}); // product_id -> { name, level }
  const lastRefresh = useRef(0);

  const token = session?.token ?? null;

  const logout = useCallback(() => {
    setSession(null);
    setKids([]);
    setActiveChildId(null);
    setQuota(null);
    setHistory([]);
    setProductCache({});
  }, []);

  // Jalankan panggilan API; token kedaluwarsa/salah (401) langsung mengeluarkan pengguna.
  const guard = useCallback(
    async (fn) => {
      try {
        return await fn(token);
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) logout();
        throw e;
      }
    },
    [token, logout],
  );

  // ---------- auth ----------

  const login = useCallback(async (email, password) => {
    const res = await api.apiLogin(email, password);
    const list = await api.apiListChildren(res.token);
    setSession({ token: res.token, user: { name: res.user.nama, email: res.user.email } });
    setKids(list);
    setActiveChildId(list[0]?.id ?? null);
  }, []);

  // Backend tidak mengembalikan token saat daftar, jadi langsung login setelahnya.
  const register = useCallback(
    async (name, email, password) => {
      await api.apiRegister(name, email, password);
      await login(email, password);
    },
    [login],
  );

  // ---------- anak ----------

  const activeChild = useMemo(
    () => kids.find((k) => k.id === activeChildId) ?? kids[0] ?? null,
    [kids, activeChildId],
  );

  const addChild = useCallback(
    async (name, age) => {
      const child = await guard((t) => api.apiCreateChild(t, name, age));
      setKids((prev) => [...prev, child]);
      setActiveChildId((prev) => prev ?? child.id);
      return child;
    },
    [guard],
  );

  // ---------- jatah harian & riwayat ----------

  const refresh = useCallback(async () => {
    if (!token || !activeChild) return;
    lastRefresh.current = Date.now();
    try {
      const [q, ...days] = await Promise.all([
        api.apiDailyQuota(token, activeChild.id),
        ...Array.from({ length: HISTORY_DAYS }, (_, i) =>
          api.apiListConsumptions(token, activeChild.id, wibDate(i)),
        ),
      ]);
      setQuota(q);
      setHistory(days.flat().map(toEntry).sort((a, b) => b.at - a.at));
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) logout();
    }
  }, [token, activeChild, logout]);

  const refreshIfStale = useCallback(() => {
    if (Date.now() - lastRefresh.current > STALE_MS) refresh();
  }, [refresh]);

  // Ganti anak (atau baru login): kosongkan data lama lalu muat ulang.
  const activeChildKey = activeChild?.id ?? null;
  useEffect(() => {
    setQuota(null);
    setHistory([]);
    lastRefresh.current = 0;
    if (token && activeChildKey) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, activeChildKey]);

  // ---------- penilaian & konsumsi ----------

  // payload: { barcode } atau { nutrisi }, plus jumlah_sajian
  const assess = useCallback(
    (payload) => guard((t) => api.apiAssess(t, { ...payload, child_id: activeChild.id })),
    [guard, activeChild],
  );

  // assessment: hasil dari assess(); request: { barcode?, nama, nutrisi, jumlah_sajian }
  const logConsumption = useCallback(
    async (assessment, request) => {
      await guard(async (t) => {
        let product = assessment.produk;
        if (!product) {
          // Input manual belum punya produk di katalog: buat dulu, baru catat konsumsinya.
          product = await api.apiCreateProduct(t, {
            nama: request.nama,
            kategori: request.nutrisi.satuan_takaran === 'ml' ? 'minuman' : 'makanan',
            nutrisi: request.nutrisi,
            ...(request.barcode ? { barcode: request.barcode } : {}),
          });
        }
        await api.apiCreateConsumption(t, activeChild.id, product.id, request.jumlah_sajian);
        setProductCache((prev) => ({
          ...prev,
          [product.id]: { name: product.nama, level: assessment.nutri_level },
        }));
      });
      await refresh();
    },
    [guard, activeChild, refresh],
  );

  // Nama dan level sebuah entri riwayat.
  const entryInfo = useCallback(
    (entry) => ({
      name: entry.produk?.nama ?? productCache[entry.productId]?.name ?? 'Jajanan',
      level: entry.level ?? productCache[entry.productId]?.level ?? null,
    }),
    [productCache],
  );

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      kids,
      activeChild,
      setActiveChildId,
      quota,
      history,
      login,
      register,
      logout,
      addChild,
      refresh,
      refreshIfStale,
      assess,
      logConsumption,
      entryInfo,
    }),
    [
      session,
      kids,
      activeChild,
      quota,
      history,
      login,
      register,
      logout,
      addChild,
      refresh,
      refreshIfStale,
      assess,
      logConsumption,
      entryInfo,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp harus dipakai di dalam <AppProvider>');
  return ctx;
}
