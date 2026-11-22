import React from 'react';
import {
  Pressable,
  StyleSheet,
} from 'react-native';

import Text from './AppText';
import { colors } from '../theme/colors';

export default function AgeOption({
  age,
  selected = false,
  onPress,
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.option,
        selected ? styles.selected : styles.unselected,
      ]}
    >
      <Text
        style={[
          styles.text,
          selected ? styles.selectedText : styles.unselectedText,
        ]}
      >
        {age}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  option: {
    width: 52,
    height: 48,
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
    fontSize: 16,
    fontWeight: '500',
  },

  selectedText: {
    color: colors.surface,
  },

  unselectedText: {
    color: colors.text,
  },
});
