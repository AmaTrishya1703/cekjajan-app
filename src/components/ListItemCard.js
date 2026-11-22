import React from 'react';
import {
  View,
  Pressable,
  StyleSheet,
} from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../theme/colors';

// right: elemen di kanan. Kalau tidak diisi, dipakai panah ›. Isi null untuk tanpa elemen.
export default function ListItemCard({
  left,
  title,
  subtitle,
  right,
  selected = false,
  onPress,
  style,
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={[styles.card, selected && styles.selected, style]}
    >
      {left}

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      {right === undefined ? (
        <Ionicons name="chevron-forward" size={22} color={colors.textSecondary} />
      ) : (
        right
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    minHeight: 69,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
  },

  // border lebih tebal, padding dikurangi supaya isi kartu tidak bergeser
  selected: {
    padding: 11,
    borderWidth: 2,
    borderColor: colors.primary,
  },

  content: {
    flex: 1,
    gap: 4,
  },

  title: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },

  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
