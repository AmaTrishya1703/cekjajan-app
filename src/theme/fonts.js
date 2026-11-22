import {
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
} from '@expo-google-fonts/nunito';

// Dimuat sekali di App.js lewat useFonts(fontFiles).
export const fontFiles = {
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
};

// Di React Native, fontWeight tidak memilih varian font kustom (terutama di Android),
// jadi tiap bobot dipetakan ke nama font-nya.
export const getFontFamily = (weight) => {
  switch (String(weight ?? '400')) {
    case '500':
      return 'Nunito_500Medium';
    case '600':
      return 'Nunito_600SemiBold';
    case '700':
    case '800':
    case '900':
    case 'bold':
      return 'Nunito_700Bold';
    default:
      return 'Nunito_400Regular';
  }
};
