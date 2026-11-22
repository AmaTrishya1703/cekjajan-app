import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
} from 'react-native';

import Text from './AppText';
import { colors } from '../theme/colors';

export default function CustomInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  helperText,
  style,
}) {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize="none"
      />

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 6,
  },

  label: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },

  input: {
    height: 52,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Nunito_400Regular',
    color: colors.text,
  },

  inputError: {
    borderWidth: 2,
    borderColor: colors.error,
  },

  errorText: {
    fontSize: 14,
    color: colors.error,
  },

  helperText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
