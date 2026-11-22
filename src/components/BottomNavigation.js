import React from 'react';
import {
  View,
  Pressable,
  StyleSheet,
} from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../theme/colors';

export const tabs = [
  { key: 'home', label: 'Beranda', icon: 'home-outline' },
  { key: 'scan', label: 'Pindai', icon: 'scan-outline' },
  { key: 'history', label: 'Riwayat', icon: 'time-outline' },
  { key: 'profile', label: 'Profil', icon: 'person-outline' },
];

export default function BottomNavigation({
  activeTab,
  onTabPress,
}) {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const active = activeTab === tab.key;
        const color = active ? colors.primary : colors.textSecondary;

        return (
          <Pressable
            key={tab.key}
            style={styles.item}
            onPress={() => onTabPress?.(tab.key)}
          >
            <Ionicons name={tab.icon} size={26} color={color} />

            <Text style={[styles.label, active && styles.active]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 84,
    width: '100%',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  item: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },

  label: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  active: {
    color: colors.primary,
  },
});
