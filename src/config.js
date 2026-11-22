// Alamat backend. Bisa diganti sementara lewat file .env di folder proyek:
//   EXPO_PUBLIC_API_URL=http://192.168.1.10:8080/api
// (HP dan laptop harus satu jaringan; "localhost" tidak bisa dipakai dari HP.)
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_CEKJAJAN_API_URL ||
  process.env.EXPO_PUBLIC_API_URL ||
  'https://mandabita.stei.site/api';

export const REQUEST_TIMEOUT_MS = 15000;

// Berapa hari riwayat dimuat. Backend hanya menyediakan riwayat per tanggal,
// jadi setiap hari = satu permintaan.
export const HISTORY_DAYS = 14;

// true = data contoh di dalam aplikasi (tanpa backend), untuk screenshot/demo.
export const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';
