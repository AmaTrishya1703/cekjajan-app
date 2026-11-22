import React from 'react';
import {
  View,
  Pressable,
  StyleSheet,
} from 'react-native';
import Text from './AppText';

import { colors } from '../theme/colors';

// "Belum punya akun? Daftar"
export default function AuthSwitch({ prefix, linkText, onPress }) {
  return (
    <View style={styles.row}>
      <Text style={styles.prefix}>{prefix}</Text>

      <Pressable onPress={onPress} hitSlop={8}>
        <Text style={styles.link}>{linkText}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },

  prefix: {
    fontSize: 16,
    color: colors.textSecondary,
  },

  link: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
});
