import React, { useState } from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import Text from '../components/AppText';

import ScreenContainer from '../components/ScreenContainer';
import CustomInput from '../components/CustomInput';
import Button from '../components/Button';
import AuthSwitch from '../components/AuthSwitch';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { useApp } from '../context/AppContext';
import { isValidEmail, EMAIL_ERROR } from '../utils/validation';

export default function LoginScreen({ navigation }) {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const next = {};
    if (!isValidEmail(email)) next.email = EMAIL_ERROR;
    if (!password) next.password = 'Isi kata sandi.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (e) {
      setErrors({ form: e.message });
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <View style={styles.logo}>
        <Text style={styles.logoText}>CJ</Text>
      </View>

      <Text style={styles.title}>CekJajan</Text>
      <Text style={styles.tagline}>
        Cek gula, garam, dan lemak jajanan anak dengan sekali pindai.
      </Text>

      <View style={styles.form}>
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
        />

        {errors.form ? <Text style={styles.formError}>{errors.form}</Text> : null}

        <Button title={loading ? 'Memproses...' : 'Masuk'} onPress={handleLogin} disabled={loading} />
      </View>

      <AuthSwitch
        prefix="Belum punya akun?"
        linkText="Daftar"
        onPress={() => navigation.navigate('Register')}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 72,
    height: 72,
    marginTop: 36,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.surface,
  },

  title: {
    marginTop: 24,
    fontSize: typography.title,
    fontWeight: '700',
    color: colors.text,
  },

  tagline: {
    marginTop: 16,
    fontSize: typography.body,
    lineHeight: 24,
    color: colors.textSecondary,
  },

  formError: {
    fontSize: typography.caption,
    color: colors.levelD,
  },

  form: {
    marginTop: 40,
    marginBottom: 24,
    gap: 16,
  },
});
