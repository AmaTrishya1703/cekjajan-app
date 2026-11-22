import React, { useState } from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import Text from '../components/AppText';

import ScreenContainer from '../components/ScreenContainer';
import AppHeader from '../components/AppHeader';
import LevelBadge from '../components/LevelBadge';
import NutritionLevel from '../components/NutritionLevel';
import WarningCard from '../components/WarningCard';
import Button from '../components/Button';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { useApp } from '../context/AppContext';
import {
  NUTRIENTS,
  LEVEL_LABEL,
  formatNumber,
  formatAmount,
  toDisplay,
} from '../data/nutrition';

const servingText = (nutrisi, servings) => {
  if (!nutrisi) return `${formatNumber(servings)} sajian`;
  const one = `${formatNumber(nutrisi.takaran_saji)} ${nutrisi.satuan_takaran}`;
  return servings === 1 ? `Per sajian ${one}` : `${formatNumber(servings)} sajian × ${one}`;
};

// params:
//  - { assessment, request } : hasil penilaian baru (dari pindai / input manual); bisa dicatat
//      assessment = respons POST /assessments
//      request    = { nama, barcode?, nutrisi, jumlah_sajian }
//  - { entry }               : membuka entri riwayat (hanya baca)
export default function ResultScreen({ navigation, route }) {
  const { assessment, request, entry } = route.params;
  const { activeChild, quota, logConsumption, entryInfo } = useApp();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const readOnly = Boolean(entry);

  let name, level, summary, portionText, totals;
  if (entry) {
    const info = entryInfo(entry);
    name = info.name;
    level = info.level;
    summary = level ? null : 'Detail penilaian belum tersedia untuk entri ini.';
    portionText = servingText(entry.produk?.nutrisi, entry.servings);
    totals = entry.ggl;
  } else {
    name = request.nama;
    level = assessment.nutri_level;
    summary = assessment.ringkasan;
    portionText = servingText(request.nutrisi, request.jumlah_sajian);
    const one = assessment.ggl_per_sajian;
    totals = {
      gula_g: one.gula_g * request.jumlah_sajian,
      garam_g: one.garam_g * request.jumlah_sajian,
      lemak_g: one.lemak_g * request.jumlah_sajian,
    };
  }

  const limits = quota?.batas ?? null;

  // Nutrisi pertama yang akan melewati batas harian jika produk ini dikonsumsi.
  const exceeded =
    readOnly || !quota
      ? null
      : NUTRIENTS.find((n) => quota.terpakai[n.key] + totals[n.key] > quota.batas[n.key]);

  const items = NUTRIENTS.map((n) => {
    const ratio = limits ? totals[n.key] / limits[n.key] : 0;
    return {
      label: `${n.label} · ${formatAmount(n, totals[n.key])}`,
      valueText: limits ? `${Math.round(ratio * 100)}% batas` : '...',
      progress: ratio,
      emphasizeValue: ratio >= 0.4,
    };
  });

  const handleLog = async () => {
    setSaving(true);
    setError(null);
    try {
      await logConsumption(assessment, request);
      navigation.navigate('Tabs', { screen: 'Beranda' });
    } catch (e) {
      setError(e.message);
      setSaving(false);
    }
  };

  const handleScanAgain = () => navigation.navigate('Tabs', { screen: 'Pindai' });

  const footer = (
    <>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {!readOnly && (
        <Button
          title={saving ? 'Menyimpan...' : 'Catat konsumsi'}
          onPress={handleLog}
          disabled={saving}
        />
      )}

      <Button title="Pindai lagi" variant="secondary" onPress={handleScanAgain} disabled={saving} />
    </>
  );

  return (
    <ScreenContainer scroll footer={footer}>
      <AppHeader title="Hasil penilaian" onBack={() => navigation.goBack()} />

      <View style={styles.titleBlock}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.caption}>
          {portionText} · dinilai untuk {activeChild.name}, {activeChild.age} tahun
        </Text>
      </View>

      <View style={styles.levelCard}>
        <LevelBadge level={level} size="lg" />

        <View style={styles.levelText}>
          <Text style={styles.levelTitle}>
            {level ? `Level ${level} · ${LEVEL_LABEL[level]}` : 'Level belum diketahui'}
          </Text>
          {summary ? <Text style={styles.levelDesc}>{summary}</Text> : null}
        </View>
      </View>

      <View style={styles.block}>
        <NutritionLevel
          title={readOnly ? 'Isi yang dikonsumsi' : 'Isi yang akan dikonsumsi'}
          subtitle={`Dibandingkan batas harian ${activeChild.name} (perkiraan).`}
          items={items}
        />
      </View>

      {exceeded && (
        <View style={styles.block}>
          <WarningCard
            title={`${exceeded.warn} hari ini akan melewati batas`}
            description={`Jika dikonsumsi, total ${exceeded.warn.toLowerCase()} ${activeChild.name} jadi ${formatNumber(
              toDisplay(exceeded, quota.terpakai[exceeded.key] + totals[exceeded.key]),
            )} ${exceeded.unit} dari batas ${formatNumber(toDisplay(exceeded, quota.batas[exceeded.key]))} ${exceeded.unit}.`}
          />
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  error: {
    fontSize: typography.caption,
    color: colors.levelD,
  },

  titleBlock: {
    marginTop: 12,
    gap: 2,
  },

  name: {
    fontSize: typography.heading,
    fontWeight: '700',
    color: colors.text,
  },

  caption: {
    fontSize: typography.caption,
    color: colors.textSecondary,
  },

  levelCard: {
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

  levelText: {
    flex: 1,
    gap: 6,
  },

  levelTitle: {
    fontSize: typography.subheading,
    fontWeight: '500',
    color: colors.text,
  },

  levelDesc: {
    fontSize: typography.body,
    lineHeight: 24,
    color: colors.textSecondary,
  },

  block: {
    marginTop: 16,
  },
});
