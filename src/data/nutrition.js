import { colors } from '../theme/colors';

// Kunci mengikuti API (gula_g, garam_g, lemak_g). Garam ditampilkan sebagai natrium (mg)
// seperti di desain: garam_g = natrium_mg x 2,5 / 1000, jadi natrium_mg = garam_g x 400.
export const NUTRIENTS = [
  { key: 'gula_g', label: 'Gula', short: 'Gula', warn: 'Gula', unit: 'g', factor: 1 },
  { key: 'garam_g', label: 'Garam (natrium)', short: 'Natrium', warn: 'Garam', unit: 'mg', factor: 400 },
  { key: 'lemak_g', label: 'Lemak', short: 'Lemak', warn: 'Lemak', unit: 'g', factor: 1 },
];

// 1200 -> "1.200", 12.5 -> "12,5"
export const formatNumber = (value) => {
  const rounded = Math.round(value * 10) / 10;
  const [int, dec] = String(rounded).split('.');
  const withDots = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return dec ? `${withDots},${dec}` : withDots;
};

// nilai API (gram) -> angka yang ditampilkan (garam jadi mg natrium)
export const toDisplay = (nutrient, value) => value * nutrient.factor;

// "12 g" / "110 mg"
export const formatAmount = (nutrient, value) =>
  `${formatNumber(toDisplay(nutrient, value))} ${nutrient.unit}`;

// "14 / 25 g"
export const formatRange = (nutrient, used, limit) =>
  `${formatNumber(toDisplay(nutrient, used))} / ${formatNumber(toDisplay(nutrient, limit))} ${nutrient.unit}`;

// Nutrisi dengan persentase tertinggi terhadap batas harian.
export const topNutrient = (amounts, limits) => {
  if (!amounts || !limits) return NUTRIENTS[0];
  return NUTRIENTS.reduce(
    (best, n) => (amounts[n.key] / limits[n.key] > amounts[best.key] / limits[best.key] ? n : best),
    NUTRIENTS[0],
  );
};

// Warna bar progres: hijau < 40%, oranye < 100%, merah >= 100%.
export const getBarColor = (ratio) => {
  if (ratio < 0.4) return colors.good;
  if (ratio < 1) return colors.levelC;
  return colors.levelD;
};

// Label level mengikuti backend (A sangat baik ... D batasi).
export const LEVEL_LABEL = { A: 'Sangat baik', B: 'Baik', C: 'Hati-hati', D: 'Batasi' };
