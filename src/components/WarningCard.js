import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../theme/colors';

export default function WarningCard({
  title,
  description,
  children,
}){
  return (
    <View style={styles.card}>
      <Ionicons
        name="warning-outline"
        size={24}
        color={colors.warningText}
        style={styles.icon}
      />

      <View style={styles.content}>
        {title && <Text style={styles.title}>{title}</Text>}

        {description && (
          <Text style={styles.description}>{description}</Text>
        )}

        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: colors.warningBackground,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },

  icon: {
    marginTop: 1,
  },

  content: {
    flex: 1,
    gap: 4,
  },

  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.warningText,
  },

  description: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.text,
  },
});
