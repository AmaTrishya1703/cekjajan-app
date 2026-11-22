import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import Text from '../components/AppText';
import { Ionicons } from '@expo/vector-icons';

import ScreenContainer from '../components/ScreenContainer';
import AppHeader from '../components/AppHeader';
import InfoCard from '../components/InfoCard';
import Button from '../components/Button';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

export default function ProductNotFoundScreen({ navigation, route }) {
  const barcode = route.params?.barcode;
  const footer = (
    <>
      <InfoCard
        title="Siapkan kemasannya"
        description="Cari tabel informasi nilai gizi, lalu isi gula, natrium, dan lemak per sajian."
      />

      <Button
        title="Input manual"
        icon="keyboard-outline"
        iconFamily="material"
        onPress={() => navigation.navigate('InputManual', { barcode })}
      />

      <Button
        title="Pindai ulang"
        variant="secondary"
        onPress={() => navigation.navigate('Tabs', { screen: 'Pindai' })}
      />
    </>
  );

  return (
    <ScreenContainer footer={footer}>
      <AppHeader title="Hasil pindai" onBack={() => navigation.goBack()} />

      <View style={styles.body}>
        <View style={styles.iconTile}>
          <Ionicons name="scan-outline" size={64} color={colors.primaryDark} />
          <Ionicons
            name="search"
            size={26}
            color={colors.primaryDark}
            style={styles.iconSearch}
          />
        </View>

        <Text style={styles.title}>Produk belum ada di data kami</Text>

        <Text style={styles.description}>
          Barcode ini belum terdaftar. Kamu tetap bisa menilai jajanan ini dengan mengisi nilai gizi dari kemasan.
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 8,
  },

  iconTile: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  iconSearch: {
    position: 'absolute',
  },

  title: {
    textAlign: 'center',
    fontSize: typography.heading,
    fontWeight: '700',
    color: colors.text,
  },

  description: {
    textAlign: 'center',
    fontSize: typography.body,
    lineHeight: 24,
    color: colors.textSecondary,
  },
});
