import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BottomNavigation from '../components/BottomNavigation';
import { colors } from '../theme/colors';

import HomeScreen from '../screens/HomeScreen';
import ScanScreen from '../screens/ScanScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

// nama rute <-> key yang dipakai BottomNavigation
const KEY_BY_ROUTE = {
  Beranda: 'home',
  Pindai: 'scan',
  Riwayat: 'history',
  Profil: 'profile',
};
const ROUTE_BY_KEY = Object.fromEntries(Object.entries(KEY_BY_ROUTE).map(([r, k]) => [k, r]));

function CustomTabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const activeRoute = state.routes[state.index].name;

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        // tinggi bar sudah memuat ±34 untuk home indicator iPhone
        paddingBottom: Math.max(insets.bottom - 34, 0),
      }}
    >
      <BottomNavigation
        activeTab={KEY_BY_ROUTE[activeRoute]}
        onTabPress={(key) => navigation.navigate(ROUTE_BY_KEY[key])}
      />
    </View>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Beranda"
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Beranda" component={HomeScreen} />
      <Tab.Screen name="Pindai" component={ScanScreen} />
      <Tab.Screen name="Riwayat" component={HistoryScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
