import React, { useState } from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import Text from '../components/AppText';

import ScreenContainer from '../components/ScreenContainer';
import AppHeader from '../components/AppHeader';
import CustomInput from '../components/CustomInput';
import AgeOption from '../components/AgeOption';
import InfoCard from '../components/InfoCard';
import Button from '../components/Button';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { useApp } from '../context/AppContext';

const AGES = [4, 5, 6, 7, 8, 9, 10, 11, 12];

export default function AddChildScreen({ navigation }) {
  const { addChild, kids } = useApp();
  const isFirstChild = kids.length === 0;
  const [name, setName] = useState('');
  const [age, setAge] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const backToManage = () => navigation.navigate('KelolaAnak');

  const handleSave = async () => {
    const next = {};
    if (!name.trim()) next.name = 'Isi nama panggilan.';
    if (age === null) next.age = 'Pilih usia anak.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      await addChild(name.trim(), age);
      if (isFirstChild) navigation.navigate('Tabs');
      else backToManage();
    } catch (e) {
      setErrors({ form: e.message });
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <AppHeader
        title={isFirstChild ? 'Tambah anak pertama' : 'Tambah anak'}
        onBack={isFirstChild ? undefined : () => navigation.goBack()}
      />

      <View style={styles.form}>
        <CustomInput
          label="Nama panggilan"
          value={name}
          onChangeText={setName}
          placeholder="Anak Uji"
          error={errors.name}
        />

        <View style={styles.ageBlock}>
          <Text style={styles.label}>Usia (tahun)</Text>

          <View style={styles.ages}>
            {AGES.map((a) => (
              <AgeOption
                key={a}
                age={a}
                selected={age === a}
                onPress={() => setAge(a)}
              />
            ))}
          </View>

          {errors.age ? (
            <Text style={styles.error}>{errors.age}</Text>
          ) : (
            <Text style={styles.helper}>CekJajan melayani anak usia 4 sampai 12 tahun.</Text>
          )}
        </View>

        <InfoCard
          title="Batas harian mengikuti usia"
          description="Batas gula, garam, dan lemak per hari dihitung dari usia anak. Hasilnya berupa perkiraan."
        />

        <View style={styles.actions}>
          {errors.form ? <Text style={styles.error}>{errors.form}</Text> : null}
          <Button title={loading ? 'Menyimpan...' : 'Simpan'} onPress={handleSave} disabled={loading} />
          {isFirstChild ? null : (
            <Button title="Batal" variant="secondary" onPress={backToManage} disabled={loading} />
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  form: {
    marginTop: 16,
    gap: 20,
  },

  ageBlock: {
    gap: 12,
  },

  label: {
    fontSize: typography.body,
    fontWeight: '500',
    color: colors.text,
  },

  ages: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  helper: {
    fontSize: typography.caption,
    color: colors.textSecondary,
  },

  error: {
    fontSize: typography.caption,
    color: colors.error,
  },

  actions: {
    gap: 16,
  },
});
