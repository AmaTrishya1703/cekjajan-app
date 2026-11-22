import React from 'react';
import {
  View,
  Pressable,
  Alert,
  StyleSheet,
} from 'react-native';
import Text from '../components/AppText';
import { Ionicons } from '@expo/vector-icons';

import ScreenContainer from '../components/ScreenContainer';
import Avatar from '../components/Avatar';
import ListItemCard from '../components/ListItemCard';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { useApp } from '../context/AppContext';

export default function ProfileScreen({ navigation }) {
  const { user, kids, activeChild, logout } = useApp();

  return (
    <ScreenContainer scroll edges={['top']}>
      <Text style={styles.title}>Profil</Text>

      <View style={styles.parentCard}>
        <Avatar letter={user.name} size={56} shape="square" solid />

        <View style={styles.parentText}>
          <Text style={styles.parentName}>{user.name}</Text>
          <Text style={styles.parentEmail}>{user.email}</Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>Anak</Text>

      <View style={styles.list}>
        {kids.map((kid) => (
          <ListItemCard
            key={kid.id}
            left={<Avatar letter={kid.name} size={44} />}
            title={kid.name}
            subtitle={`${kid.age} tahun${kid.id === activeChild?.id ? ' · Aktif' : ''}`}
            onPress={() => navigation.navigate('KelolaAnak')}
          />
        ))}
      </View>

      <View style={styles.menu}>
        <Pressable
          style={styles.menuRow}
          onPress={() => Alert.alert('Bantuan', 'Halaman bantuan belum tersedia.')}
        >
          <Ionicons name="help-circle-outline" size={26} color={colors.textSecondary} />
          <Text style={styles.menuText}>Bantuan</Text>
          <Ionicons name="chevron-forward" size={22} color={colors.textSecondary} />
        </Pressable>

        <View style={styles.divider} />

        <Pressable style={styles.menuRow} onPress={logout}>
          <Ionicons name="log-out-outline" size={26} color={colors.error} />
          <Text style={styles.menuText}>Keluar</Text>
        </Pressable>
      </View>

      <Text style={styles.note}>
        Data anak dan konsumsinya hanya bisa dilihat oleh keluargamu.
      </Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: typography.title,
    fontWeight: '700',
    color: colors.text,
  },

  parentCard: {
    marginTop: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
  },

  parentText: {
    flex: 1,
    gap: 2,
  },

  parentName: {
    fontSize: typography.subheading,
    fontWeight: '500',
    color: colors.text,
  },

  parentEmail: {
    fontSize: typography.body,
    color: colors.textSecondary,
  },

  sectionLabel: {
    marginTop: 24,
    marginBottom: 8,
    fontSize: typography.caption,
    color: colors.textSecondary,
  },

  list: {
    gap: 8,
  },

  menu: {
    marginTop: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    overflow: 'hidden',
  },

  menuRow: {
    minHeight: 56,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  menuText: {
    flex: 1,
    fontSize: typography.body,
    fontWeight: '500',
    color: colors.text,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
  },

  note: {
    marginTop: 16,
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
});
