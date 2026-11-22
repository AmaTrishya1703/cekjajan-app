import React from 'react';
import {
  Pressable,
  StyleSheet,
} from 'react-native';

import Text from './AppText';
import { colors } from '../theme/colors';

export default function Chip({
  label,
  selected = false,
  onPress,
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        selected ? styles.selected : styles.unselected,
      ]}
    >
      <Text
        style={[
          styles.text,
          selected ? styles.selectedText : styles.unselectedText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  selected: {
    backgroundColor: colors.primary,
  },

  unselected: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  text: {
    fontSize: 14,
    fontWeight: '500',
  },

  selectedText: {
    color: colors.surface,
  },

  unselectedText: {
    color: colors.text,
  },
});
