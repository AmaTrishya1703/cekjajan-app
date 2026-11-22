import React from 'react';
import { Text as RNText, StyleSheet } from 'react-native';

import { getFontFamily } from '../theme/fonts';

// Pengganti <Text> dari react-native: otomatis memakai Nunito sesuai fontWeight pada style.
export default function AppText({ style, ...props }) {
  const { fontWeight, ...rest } = StyleSheet.flatten(style) ?? {};

  return (
    <RNText
      {...props}
      style={[{ fontFamily: rest.fontFamily ?? getFontFamily(fontWeight) }, rest]}
    />
  );
}
