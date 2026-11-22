import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  StyleSheet,
} from 'react-native';
import Text from '../components/AppText';

import ScreenContainer from '../components/ScreenContainer';
import Chip from '../components/Chip';
import ProductCard from '../components/ProductCard';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { useApp } from '../context/AppContext';
import { NUTRIENTS, formatAmount, topNutrient } from '../data/nutrition';
import { dayLabel, daysAgo, formatTime } from '../utils/date';

const FILTERS = [
  { key: 'all', label: 'Semua' },
  { key: 'today', label: 'Hari ini' },
  { key: 'week', label: '7 hari' },
];

const matchesFilter = (entry, filter) => {
  if (filter === 'today') return daysAgo(entry.at) === 0;
  if (filter === 'week') return daysAgo(entry.at) < 7;
  return true;
};

export default function HistoryScreen({ navigation }) {
  const { activeChild, quota, history, entryInfo, refreshIfStale } = useApp();
  const [filter, setFilter] = useState('all');

  useFocusEffect(
    useCallback(() => {
      refreshIfStale();
    }, [refreshIfStale]),
  );

  // history sudah urut terbaru -> kelompokkan per hari berurutan.
  const groups = [];
  history
    .filter((entry) => matchesFilter(entry, filter))
    .forEach((entry) => {
      const label = dayLabel(entry.at);
      const last = groups[groups.length - 1];
      if (last && last.label === label) last.items.push(entry);
      else groups.push({ label, items: [entry] });
    });

  const subtitleFor = (entry) => {
    const n = quota ? topNutrient(entry.ggl, quota.batas) : NUTRIENTS[0];
    const x = entry.servings !== 1 ? ` · ${entry.servings} sajian` : '';
    return `${formatTime(entry.at)} · ${n.short} ${formatAmount(n, entry.ggl[n.key])}${x}`;
  };

  return (
    <ScreenContainer scroll edges={['top']}>
      <Text style={styles.title}>Riwayat</Text>
      <Text style={styles.subtitle}>
        Jajanan yang pernah dipindai untuk {activeChild.name}.
      </Text>

      <View style={styles.chips}>
        {FILTERS.map((f) => (
          <Chip
            key={f.key}
            label={f.label}
            selected={filter === f.key}
            onPress={() => setFilter(f.key)}
          />
        ))}
      </View>

      {groups.length === 0 ? (
        <Text style={styles.empty}>Belum ada jajanan yang dipindai.</Text>
      ) : (
        groups.map((group) => (
          <View key={group.label} style={styles.group}>
            <Text style={styles.groupLabel}>{group.label}</Text>

            <View style={styles.list}>
              {group.items.map((entry) => {
                const info = entryInfo(entry);
                return (
                  <ProductCard
                    key={entry.id}
                    name={info.name}
                    level={info.level}
                    subtitle={subtitleFor(entry)}
                    onPress={() => navigation.navigate('Hasil', { entry })}
                  />
                );
              })}
            </View>
          </View>
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: typography.title,
    fontWeight: '700',
    color: colors.text,
  },

  subtitle: {
    marginTop: 2,
    fontSize: typography.body,
    color: colors.textSecondary,
  },

  chips: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 8,
  },

  group: {
    marginTop: 16,
    gap: 8,
  },

  groupLabel: {
    fontSize: typography.caption,
    color: colors.textSecondary,
  },

  list: {
    gap: 8,
  },

  empty: {
    marginTop: 32,
    textAlign: 'center',
    fontSize: typography.body,
    color: colors.textSecondary,
  },
});
