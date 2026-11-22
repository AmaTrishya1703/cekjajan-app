import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import Text from './AppText';

import { colors } from '../theme/colors';
import { getBarColor } from '../data/nutrition';

// label          : teks kiri
// valueText      : teks kanan (mis. "14 / 25 g" atau "48% batas")
// progress       : 0..1 (lebih dari 1 dipotong untuk lebar bar)
// barColor       : opsional; kalau kosong warna dihitung dari progress
// emphasizeValue : tebalkan teks kanan (dipakai di layar Hasil)
export default function NutritionProgress({
  label,
  valueText,
  progress,
  barColor,
  emphasizeValue = false,
}) {
  const percentage = Math.max(0, Math.min(progress, 1));
  const fillColor = barColor ?? getBarColor(progress);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>

        <Text style={[styles.value, emphasizeValue && styles.valueEmphasis]}>
          {valueText}
        </Text>
      </View>

      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            {
              width: `${percentage * 100}%`,
              backgroundColor: fillColor,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 8,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },

  label: {
    flexShrink: 1,
    fontSize: 16,
    color: colors.text,
  },

  value: {
    fontSize: 14,
    color: colors.textSecondary,
  },

  valueEmphasis: {
    fontWeight: '600',
    color: colors.text,
  },

  track: {
    width: '100%',
    height: 8,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.progressBackground,
  },

  fill: {
    height: '100%',
    borderRadius: 20,
  },
});
