import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import MainTabs from './MainTabs';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ProductNotFoundScreen from '../screens/ProductNotFoundScreen';
import ResultScreen from '../screens/ResultScreen';
import ManualInputScreen from '../screens/ManualInputScreen';
import ManageChildrenScreen from '../screens/ManageChildrenScreen';
import AddChildScreen from '../screens/AddChildScreen';

const Stack = createNativeStackNavigator();

const theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.background },
};

export default function RootNavigator() {
  const { user, kids } = useApp();

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        // key berubah => navigator dibuat ulang (login/keluar, anak pertama tersimpan).
        key={!user ? 'auth' : kids.length === 0 ? 'onboarding' : 'app'}
        screenOptions={{ headerShown: false }}
        // Akun baru belum punya profil anak: langsung minta mengisi dulu.
        initialRouteName={user && kids.length === 0 ? 'TambahAnak' : undefined}
      >
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Tabs" component={MainTabs} />
            <Stack.Screen name="ProdukTidakDitemukan" component={ProductNotFoundScreen} />
            <Stack.Screen name="Hasil" component={ResultScreen} />
            <Stack.Screen name="InputManual" component={ManualInputScreen} />
            <Stack.Screen name="KelolaAnak" component={ManageChildrenScreen} />
            <Stack.Screen name="TambahAnak" component={AddChildScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
