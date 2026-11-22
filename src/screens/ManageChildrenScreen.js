import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import Text from '../components/AppText';
import { Ionicons } from '@expo/vector-icons';

import ScreenContainer from '../components/ScreenContainer';
import AppHeader from '../components/AppHeader';
import Avatar from '../components/Avatar';
import ListItemCard from '../components/ListItemCard';
import InfoCard from '../components/InfoCard';
import Button from '../components/Button';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { useApp } from '../context/AppContext';

export default function ManageChildrenScreen({ navigation }) {
  const { kids, activeChild, setActiveChildId } = useApp();

  const footer = (
    <Button
      title="Tambah anak"
      icon="add"
      onPress={() => navigation.navigate('TambahAnak')}
    />
  );

  return (
    <ScreenContainer scroll footer={footer}>
      <AppHeader title="Kelola anak" onBack={() => navigation.goBack()} />

      <Text style={styles.intro}>
        Pilih anak yang sedang dinilai jajanannya. Batas harian mengikuti usia.
      </Text>

      <View style={styles.list}>
        {kids.map((kid) => {
          const selected = kid.id === activeChild?.id;

          return (
            <ListItemCard
              key={kid.id}
              selected={selected}
              left={<Avatar letter={kid.name} size={44} />}
              title={kid.name}
              subtitle={`${kid.age} tahun${selected ? ' · Aktif' : ''}`}
              onPress={() => setActiveChildId(kid.id)}
              right={
                selected ? (
                  <Ionicons name="checkmark-circle-outline" size={28} color={colors.primary} />
                ) : (
                  <Ionicons name="ellipse-outline" size={28} color={colors.border} />
                )
              }
            />
          );
        })}
      </View>

      <View style={styles.info}>
        <InfoCard
          title="Batas harian mengikuti usia"
          description="Batas gula, garam, dan lemak per hari dihitung dari usia anak. Hasilnya berupa perkiraan."
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  intro: {
    marginTop: 8,
    fontSize: typography.body,
    lineHeight: 24,
    color: colors.textSecondary,
  },

  list: {
    marginTop: 16,
    gap: 8,
  },

  info: {
    marginTop: 16,
  },
});
