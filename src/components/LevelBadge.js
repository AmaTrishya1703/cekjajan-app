import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import Text from './AppText';

import { colors } from '../theme/colors';

const LEVEL_STYLE = {
  A: { bg: colors.levelA, fg: colors.surface },
  B: { bg: colors.levelB, fg: colors.text },
  C: { bg: colors.levelC, fg: colors.text },
  D: { bg: colors.levelD, fg: colors.surface },
};

const SIZE = {
  sm: { box: 44, radius: 14, font: 20 },
  lg: { box: 72, radius: 20, font: 40 },
};

export default function LevelBadge({ level, size = 'sm' }) {
  const tone = LEVEL_STYLE[level] ?? { bg: colors.border, fg: colors.textSecondary };
  const dim = SIZE[size] ?? SIZE.sm;

  return (
    <View
      style={[
        styles.badge,
        {
          width: dim.box,
          height: dim.box,
          borderRadius: dim.radius,
          backgroundColor: tone.bg,
        },
      ]}
    >
      <Text style={[styles.text, { fontSize: dim.font, color: tone.fg }]}>
        {LEVEL_STYLE[level] ? level : '?'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  text: {
    fontWeight: '700',
  },
});
