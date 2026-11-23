import React, { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Pressable,
  StyleSheet,
} from 'react-native';
import Text from '../components/AppText';
import { Ionicons } from '@expo/vector-icons';

import ScreenContainer from '../components/ScreenContainer';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import NutritionLevel from '../components/NutritionLevel';
import ProductCard from '../components/ProductCard';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { useApp } from '../context/AppContext';
import { NUTRIENTS, formatRange } from '../data/nutrition';
import { dayLabel, formatTime } from '../utils/date';

export default function HomeScreen({ navigation }) {
  const { activeChild, quota, history, entryInfo, refreshIfStale } = useApp();

  useFocusEffect(
    useCallback(() => {
      refreshIfStale();
    }, [refreshIfStale]),
  );

  const items = NUTRIENTS.map((n) => ({
    label: n.label,
    valueText: quota ? formatRange(n, quota.terpakai[n.key], quota.batas[n.key]) : '...',
    progress: quota ? quota.terpakai[n.key] / quota.batas[n.key] : 0,
  }));

  const recent = history.slice(0, 3);

  if (!activeChild) {
    return (
      <ScreenContainer edges={['top']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 12 }}>
          <Text style={styles.title}>Belum ada profil anak</Text>
          <Text style={styles.subtitle}>Tambahkan profil anak dulu untuk mulai memindai jajanan.</Text>
          <Button title="Tambah anak" onPress={() => navigation.navigate('KelolaAnak')} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll edges={['top']}>
      <View style={styles.topRow}>
        <View style={styles.greeting}>
          <Text style={styles.title}>Halo!</Text>
          <Text style={styles.subtitle}>Yuk cek jajanan hari ini.</Text>
        </View>

        <Pressable
          style={styles.childChip}
          onPress={() => navigation.navigate('KelolaAnak')}
        >
          <Avatar letter={activeChild.name} size={32} />
          <Text style={styles.childText}>
            {activeChild.name} · {activeChild.age} th
          </Text>
          <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.section}>
        <NutritionLevel
          title="Perkiraan hari ini"
          subtitle={`Gula, garam, dan lemak dari jajanan ${activeChild.name}.`}
          items={items}
        />
      </View>

      <View style={styles.section}>
        <Button
          title="Pindai jajanan"
          icon="scan-outline"
          onPress={() => navigation.navigate('Pindai')}
        />
      </View>

      <View style={styles.recentHeader}>
        <Text style={styles.recentTitle}>Terakhir dipindai</Text>

        <Pressable onPress={() => navigation.navigate('Riwayat')} hitSlop={8}>
          <Text style={styles.seeAll}>Lihat semua</Text>
        </Pressable>
      </View>

      <View style={styles.list}>
        {recent.length === 0 ? (
          <Text style={styles.empty}>Belum ada jajanan yang dicatat.</Text>
        ) : (
          recent.map((entry) => {
            const info = entryInfo(entry);
            return (
              <ProductCard
                key={entry.id}
                name={info.name}
                level={info.level}
                subtitle={`${dayLabel(entry.at)} · ${formatTime(entry.at)}`}
                onPress={() => navigation.navigate('Hasil', { entry })}
              />
            );
          })
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },

  greeting: {
    flexShrink: 1,
    gap: 2,
  },

  title: {
    fontSize: typography.title,
    fontWeight: '700',
    color: colors.text,
  },

  subtitle: {
    fontSize: typography.body,
    color: colors.textSecondary,
  },

  childChip: {
    height: 44,
    paddingLeft: 6,
    paddingRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
  },

  childText: {
    fontSize: typography.body,
    fontWeight: '500',
    color: colors.text,
  },

  section: {
    marginTop: 16,
  },

  recentHeader: {
    marginTop: 24,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  recentTitle: {
    fontSize: typography.subheading,
    fontWeight: '500',
    color: colors.text,
  },

  seeAll: {
    fontSize: typography.body,
    fontWeight: '500',
    color: colors.primaryDark,
  },

  list: {
    gap: 8,
  },

  empty: {
    fontSize: typography.body,
    color: colors.textSecondary,
  },
});
