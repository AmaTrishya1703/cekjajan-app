import React from 'react';
import {
  Pressable,
  StyleSheet,
} from 'react-native';
import Text from './AppText';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { colors } from '../theme/colors';

// icon       : nama ikon (opsional)
// iconFamily : 'ionicons' (default) atau 'material' (MaterialCommunityIcons)
export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  icon,
  iconFamily = 'ionicons',
  style,
  textStyle,
}) {
  const isPrimary = variant === 'primary';
  const Icon = iconFamily === 'material' ? MaterialCommunityIcons : Ionicons;
  const contentColor = isPrimary ? colors.surface : colors.primary;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        isPrimary ? styles.primary : styles.secondary,
        disabled && styles.disabled,
        style,
      ]}
    >
      {icon ? <Icon name={icon} size={24} color={contentColor} /> : null}

      <Text
        style={[
          styles.text,
          isPrimary ? styles.primaryText : styles.secondaryText,
          textStyle,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  primary: {
    backgroundColor: colors.primary,
  },

  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
  },

  disabled: {
    opacity: 0.5,
  },

  text: {
    fontSize: 16,
    fontWeight: '600',
  },

  primaryText: {
    color: colors.surface,
  },

  secondaryText: {
    color: colors.primary,
  },
});
