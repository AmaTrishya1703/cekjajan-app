# CekJajan (aplikasi mobile)

Aplikasi React Native (Expo) untuk orang tua: pindai barcode jajanan anak, lihat Nutri-Level (A–D) berdasarkan gula, garam, dan lemak, lalu catat konsumsinya terhadap batas harian sesuai usia anak.

Bagian dari Tugas Besar TST × PWAM. Backend: [mandabita-cekjajan](https://github.com/tsabitakhoir/mandabita-cekjajan) (FastAPI).

## Fitur

- Daftar dan masuk akun orang tua
- Kelola profil anak (nama panggilan dan usia 4–12 tahun)
- Pindai barcode kemasan, atau isi nilai gizi secara manual
- Hasil penilaian Nutri-Level beserta dampaknya terhadap batas harian anak
- Catat konsumsi, lihat ringkasan hari ini dan riwayat

## Teknologi

Expo SDK 58, React Native, React Navigation (native-stack dan bottom-tabs), expo-camera, Nunito (`@expo-google-fonts/nunito`).

## Menjalankan

Prasyarat: Node.js, aplikasi **Expo Go** di HP (SDK 58), HP dan laptop satu jaringan Wi-Fi.

```bash
npm install
cp .env.example .env      # Windows PowerShell: Copy-Item .env.example .env
npx expo start -c
```

Pindai QR yang muncul memakai Expo Go.

## Konfigurasi (`.env`)

Setelah mengubah `.env`, jalankan ulang dengan `npx expo start -c`.

| Variabel | Fungsi |
|---|---|
| `EXPO_PUBLIC_CEKJAJAN_API_URL` | Alamat backend, sudah termasuk `/api`. Bawaan: `https://mandabita.stei.site/api` |
| `EXPO_PUBLIC_USE_MOCK` | `true` = mode demo dengan data contoh di dalam aplikasi, tanpa backend dan tanpa internet |

## Akun demo

**Mode demo (`EXPO_PUBLIC_USE_MOCK=true`):** masuk dengan email dan kata sandi apa saja yang tidak kosong. Anak contoh (Aisyah 8 th dan Raka 5 th) beserta riwayatnya sudah tersedia. Data hanya hidup di memori dan kembali ke awal saat aplikasi ditutup.

Barcode contoh untuk mode demo:

| Barcode | Produk | Level |
|---|---|---|
| `8999999000011` | Biskuit Cokelat | C |
| `8999999000028` | Susu Cokelat Kotak | B |
| `8999999000035` | Yogurt Plain Cup | A |

Barcode lain membuka layar "Produk belum ada di data kami" dan dilanjutkan dengan input manual.

## Struktur singkat

```
App.js                 Pemuat font dan penyedia state
src/api/               client.js (fetch + error), cekjajan.js (endpoint), mock.js (mode demo)
src/context/           AppContext: sesi, anak, jatah harian, riwayat
src/screens/           Login, Register, Home, Scan, Hasil, ManualInput, History, Profile, Kelola/Tambah anak
src/components/        Komponen UI bersama
src/navigation/        Stack utama dan tab bawah
src/theme/             Warna, spasi, tipografi, font
```

## Catatan

- Token login disimpan di memori saja, jadi perlu masuk lagi setelah aplikasi ditutup.
- Backend hanya menyediakan riwayat per tanggal, sehingga aplikasi memuat 14 hari terakhir.
- Garam ditampilkan sebagai natrium (mg): `natrium_mg = garam_g × 400`.
- Hasil penilaian bersifat perkiraan dan bukan saran medis.
