import React from 'react';
import { View, StyleSheet } from 'react-native';

import Text from './AppText';
import { colors } from '../theme/colors';

export default function InfoCard({
  title,
  description,
  children,
  style,
}) {
  return (
    <View style={[styles.card, style]}>
      {title && <Text style={styles.title}>{title}</Text>}

      {description && (
        <Text style={styles.description}>{description}</Text>
      )}

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    padding: 16,
    gap: 4,
    backgroundColor: colors.primaryLight,
    borderRadius: 16,
  },

  title: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.primaryDark,
  },

  description: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.text,
  },
});
