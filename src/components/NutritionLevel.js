import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import Text from './AppText';

import { colors } from '../theme/colors';
import NutritionProgress from './NutritionProgress';

// items: [{ label, valueText, progress, emphasizeValue? }]
export default function NutritionLevel({
  title,
  subtitle,
  items = [],
}) {
  return (
    <View style={styles.card}>
      <View style={styles.heading}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      {items.map((item) => (
        <NutritionProgress key={item.label} {...item} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    padding: 16,
    gap: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
  },

  heading: {
    gap: 4,
  },

  title: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.text,
  },

  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
