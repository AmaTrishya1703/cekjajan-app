import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import Text from './AppText';

import { colors } from '../theme/colors';

// shape: 'circle' | 'square'; solid: latar hijau tua + huruf putih
export default function Avatar({
  letter,
  size = 44,
  shape = 'circle',
  solid = false,
}) {
  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: shape === 'circle' ? size / 2 : size * 0.29,
          backgroundColor: solid ? colors.primary : colors.primaryLight,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            fontSize: Math.round(size * 0.42),
            color: solid ? colors.surface : colors.primaryDark,
          },
        ]}
      >
        {String(letter ?? '?').charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  text: {
    fontWeight: '600',
  },
});
