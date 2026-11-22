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
import AuthSwitch from '../components/AuthSwitch';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { useApp } from '../context/AppContext';
import { isValidEmail, EMAIL_ERROR, MIN_PASSWORD } from '../utils/validation';

export default function RegisterScreen({ navigation }) {
  const { register } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const goToLogin = () => navigation.navigate('Login');

  const handleRegister = async () => {
    const next = {};
    if (!name.trim()) next.name = 'Isi nama lengkap.';
    if (!isValidEmail(email)) next.email = EMAIL_ERROR;
    if (password.length < MIN_PASSWORD) next.password = `Kata sandi minimal ${MIN_PASSWORD} karakter.`;
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
    } catch (e) {
      setErrors({ form: e.message });
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <AppHeader title="Buat akun" onBack={goToLogin} />

      <Text style={styles.intro}>
        Akun orang tua mengelola profil anak dan catatan jajanannya.
      </Text>

      <View style={styles.form}>
        <CustomInput
          label="Nama lengkap"
          value={name}
          onChangeText={setName}
          placeholder="Orang Tua Uji"
          error={errors.name}
        />

        <CustomInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="ortu.uji@example.com"
          keyboardType="email-address"
          error={errors.email}
        />

        <CustomInput
          label="Kata sandi"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••••"
          secureTextEntry
          error={errors.password}
          helperText={`Minimal ${MIN_PASSWORD} karakter`}
        />

        {errors.form ? <Text style={styles.formError}>{errors.form}</Text> : null}

        <Button title={loading ? 'Memproses...' : 'Daftar'} onPress={handleRegister} disabled={loading} />
      </View>

      <AuthSwitch prefix="Sudah punya akun?" linkText="Masuk" onPress={goToLogin} />

      <Text style={styles.note}>
        Data anak dan konsumsinya hanya bisa dilihat oleh keluargamu.
      </Text>
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

  formError: {
    fontSize: typography.caption,
    color: colors.levelD,
  },

  form: {
    marginTop: 16,
    marginBottom: 24,
    gap: 16,
  },

  note: {
    marginTop: 20,
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
});
