import React from 'react';
import {
  View,
  Pressable,
  StyleSheet,
} from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../theme/colors';

export default function AppHeader({ title, onBack, style }) {
  return (
    <View style={[styles.container, style]}>
      {onBack && (
        <Pressable onPress={onBack} style={styles.backButton} hitSlop={8}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </Pressable>
      )}

      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  backButton: {
    width: 28,
    height: 40,
    justifyContent: 'center',
  },

  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '500',
    color: colors.text,
  },
});
