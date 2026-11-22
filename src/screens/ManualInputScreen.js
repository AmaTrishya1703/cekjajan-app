import React, { useState } from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import Text from '../components/AppText';

import ScreenContainer from '../components/ScreenContainer';
import AppHeader from '../components/AppHeader';
import CustomInput from '../components/CustomInput';
import Button from '../components/Button';
import Chip from '../components/Chip';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

const NUMERIC_FIELDS = [
  { key: 'serving', example: '200' },
  { key: 'sugar', example: '15' },
  { key: 'sodium', example: '30' },
  { key: 'fat', example: '5' },
  { key: 'servings', example: '1' },
];

// "12,5" / "12.5" -> 12.5; selain angka >= 0 -> null
const parseNumber = (value) => {
  const text = String(value).trim().replace(',', '.');
  if (text === '') return null;
  const n = Number(text);
  return Number.isFinite(n) && n >= 0 ? n : null;
};

export default function ManualInputScreen({ navigation, route }) {
  const { assess } = useApp();
  const barcode = route.params?.barcode;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    serving: '',
    unit: 'g',
    sugar: '',
    sodium: '',
    fat: '',
    servings: '1',
  });
  const [errors, setErrors] = useState({});

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    const next = {};
    const nums = {};

    NUMERIC_FIELDS.forEach(({ key, example }) => {
      const n = parseNumber(form[key]);
      if (n === null) next[key] = `Isi dengan angka, mis. ${example}`;
      else nums[key] = n;
    });

    if (!next.serving && nums.serving < 0.1) next.serving = 'Isi minimal 0,1';
    if (!next.servings && nums.servings <= 0) next.servings = 'Isi lebih dari 0';

    setErrors(next);
    if (Object.keys(next).length) return;

    const request = {
      nama: form.name.trim() || 'Produk tanpa nama',
      ...(barcode ? { barcode } : {}),
      nutrisi: {
        takaran_saji: nums.serving,
        satuan_takaran: form.unit,
        gula_g: nums.sugar,
        natrium_mg: nums.sodium,
        lemak_g: nums.fat,
      },
      jumlah_sajian: nums.servings,
    };

    setLoading(true);
    try {
      const assessment = await assess({ nutrisi: request.nutrisi, jumlah_sajian: request.jumlah_sajian });
      navigation.navigate('Hasil', { assessment, request });
    } catch (e) {
      setErrors({ form: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <AppHeader title="Input nilai gizi" onBack={() => navigation.goBack()} />

      <Text style={styles.intro}>
        Isi sesuai tabel informasi nilai gizi di kemasan (per sajian).
      </Text>

      <View style={styles.form}>
        <CustomInput
          label="Nama produk (opsional)"
          value={form.name}
          onChangeText={set('name')}
          placeholder="Teh Manis Kemasan Contoh"
        />

        <View style={styles.row}>
          <View style={styles.col}>
            <CustomInput
              label="Takaran saji"
              value={form.serving}
              onChangeText={set('serving')}
              placeholder="200"
              keyboardType="decimal-pad"
              error={errors.serving}
            />
          </View>
          <View style={styles.col}>
            <Text style={styles.unitLabel}>Satuan</Text>
            <View style={styles.units}>
              <Chip label="g" selected={form.unit === 'g'} onPress={() => set('unit')('g')} />
              <Chip label="ml" selected={form.unit === 'ml'} onPress={() => set('unit')('ml')} />
            </View>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.col}>
            <CustomInput
              label="Gula (g)"
              value={form.sugar}
              onChangeText={set('sugar')}
              placeholder="15"
              keyboardType="decimal-pad"
              error={errors.sugar}
            />
          </View>
          <View style={styles.col}>
            <CustomInput
              label="Natrium (mg)"
              value={form.sodium}
              onChangeText={set('sodium')}
              placeholder="30"
              keyboardType="decimal-pad"
              error={errors.sodium}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.col}>
            <CustomInput
              label="Lemak (g)"
              value={form.fat}
              onChangeText={set('fat')}
              placeholder="0"
              keyboardType="decimal-pad"
              error={errors.fat}
            />
          </View>
          <View style={styles.col}>
            <CustomInput
              label="Jumlah sajian"
              value={form.servings}
              onChangeText={set('servings')}
              placeholder="1"
              keyboardType="decimal-pad"
              error={errors.servings}
            />
          </View>
        </View>

        {errors.form ? <Text style={styles.formError}>{errors.form}</Text> : null}

        <Button title={loading ? 'Menilai...' : 'Nilai sekarang'} onPress={handleSubmit} disabled={loading} />
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

  form: {
    marginTop: 16,
    gap: 16,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },

  col: {
    flex: 1,
  },

  unitLabel: {
    marginBottom: 8,
    fontSize: typography.body,
    fontWeight: '500',
    color: colors.text,
  },

  units: {
    flexDirection: 'row',
    gap: 8,
  },

  formError: {
    fontSize: typography.caption,
    color: colors.levelD,
  },
});
