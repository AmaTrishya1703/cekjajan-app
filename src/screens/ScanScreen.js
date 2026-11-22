import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
} from 'react-native';
import Text from '../components/AppText';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '../components/Button';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useApp } from '../context/AppContext';
import { ApiError } from '../api/client';

const BARCODE_TYPES = ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'];

const FRAME_W = 290;
const FRAME_H = 200;
const FRAME_RADIUS = 28;

export default function ScanScreen({ navigation }) {
  const { activeChild, assess } = useApp();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState(false);
  const [status, setStatus] = useState(null); // null | 'loading' | pesan error
  const lockRef = useRef(false);

  // Buka kunci pemindai setiap kali layar ini kembali aktif.
  useFocusEffect(
    useCallback(() => {
      lockRef.current = false;
      setStatus(null);
    }, []),
  );

  const handleScanned = async ({ data }) => {
    if (lockRef.current) return;
    lockRef.current = true;

    const barcode = String(data).trim();
    setStatus('loading');
    try {
      const assessment = await assess({ barcode, jumlah_sajian: 1 });
      const produk = assessment.produk;
      setStatus(null);
      navigation.navigate('Hasil', {
        assessment,
        request: { nama: produk.nama, nutrisi: produk.nutrisi, jumlah_sajian: 1 },
      });
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        setStatus(null);
        navigation.navigate('ProdukTidakDitemukan', { barcode });
      } else {
        // Gagal sementara (jaringan, batas permintaan): tampilkan pesan lalu izinkan memindai lagi.
        setStatus(e.message);
        setTimeout(() => {
          lockRef.current = false;
          setStatus(null);
        }, 3000);
      }
    }
  };

  const hasPermission = permission?.granted;

  return (
    <View style={styles.screen}>
      {isFocused ? <StatusBar style="light" /> : null}

      {/* Kamera memenuhi seluruh layar sampai ke balik panel putih. */}
      {hasPermission && isFocused ? (
        <CameraView
          key={`camera-${hasPermission}`}
          style={StyleSheet.absoluteFill}
          facing="back"
          enableTorch={torch}
          barcodeScannerSettings={{ barcodeTypes: BARCODE_TYPES }}
          onBarcodeScanned={handleScanned}
        />
      ) : null}

      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Pindai barcode</Text>
          <Text style={styles.subtitle}>
            Untuk {activeChild.name}, {activeChild.age} tahun
          </Text>
        </View>

        <Pressable
          style={[styles.flashButton, torch && styles.flashActive]}
          onPress={() => setTorch((t) => !t)}
        >
          <Ionicons name={torch ? 'flash' : 'flash-outline'} size={24} color={colors.surface} />
        </Pressable>
      </View>

      <View style={styles.center} pointerEvents="box-none">
        <View style={styles.frame} pointerEvents="box-none">
          {hasPermission ? (
            // Meredupkan semua area di luar bingkai; bagian dalam bingkai tetap jernih.
            <View style={styles.mask} pointerEvents="none" />
          ) : (
            <Pressable style={styles.permission} onPress={requestPermission}>
              <Ionicons name="camera-outline" size={28} color={colors.surface} />
              <Text style={styles.permissionText}>Izinkan akses kamera</Text>
            </Pressable>
          )}

          <View style={[styles.corner, styles.topLeft]} pointerEvents="none" />
          <View style={[styles.corner, styles.topRight]} pointerEvents="none" />
          <View style={[styles.corner, styles.bottomLeft]} pointerEvents="none" />
          <View style={[styles.corner, styles.bottomRight]} pointerEvents="none" />

          <View style={styles.scanLine} pointerEvents="none" />
        </View>

        <Text style={styles.hint}>
          {status === 'loading'
            ? 'Mencari produk...'
            : status || 'Arahkan kamera ke barcode di kemasan jajanan.'}
        </Text>
      </View>

      <View style={styles.sheet}>
        <View style={styles.sheetText}>
          <Text style={styles.sheetTitle}>Barcode tidak terbaca?</Text>
          <Text style={styles.sheetDesc}>
            Isi nilai gizi dari tabel informasi nilai gizi di kemasan.
          </Text>
        </View>

        <Button
          title="Input manual"
          variant="secondary"
          icon="keyboard-outline"
          iconFamily="material"
          onPress={() => navigation.navigate('InputManual')}
        />
      </View>
    </View>
  );
}

const CORNER = 42;
const THICK = 4;

// View dengan border sangat tebal = "bingkai" peredup. Radius dalamnya
// (borderRadius - borderWidth) sama dengan radius bingkai.
const MASK_BORDER = 600;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.text,
  },

  header: {
    paddingHorizontal: spacing.screenHorizontal,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  headerText: {
    gap: 2,
  },

  title: {
    fontSize: 20,
    fontWeight: '500',
    color: colors.surface,
  },

  subtitle: {
    fontSize: typography.caption,
    color: 'rgba(255,255,255,0.85)',
  },

  flashButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    backgroundColor: 'rgba(20,40,31,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  flashActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.screenHorizontal,
  },

  frame: {
    width: FRAME_W,
    height: FRAME_H,
  },

  mask: {
    position: 'absolute',
    top: -MASK_BORDER,
    left: -MASK_BORDER,
    width: FRAME_W + MASK_BORDER * 2,
    height: FRAME_H + MASK_BORDER * 2,
    borderWidth: MASK_BORDER,
    borderRadius: MASK_BORDER + FRAME_RADIUS,
    borderColor: 'rgba(20,40,31,0.62)',
  },

  permission: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: FRAME_RADIUS,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },

  permissionText: {
    fontSize: typography.body,
    color: colors.surface,
  },

  corner: {
    position: 'absolute',
    width: CORNER,
    height: CORNER,
    borderColor: colors.levelA,
  },

  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: THICK,
    borderLeftWidth: THICK,
    borderTopLeftRadius: FRAME_RADIUS,
  },

  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: THICK,
    borderRightWidth: THICK,
    borderTopRightRadius: FRAME_RADIUS,
  },

  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: THICK,
    borderLeftWidth: THICK,
    borderBottomLeftRadius: FRAME_RADIUS,
  },

  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: THICK,
    borderRightWidth: THICK,
    borderBottomRightRadius: FRAME_RADIUS,
  },

  scanLine: {
    position: 'absolute',
    top: '50%',
    left: 27,
    right: 27,
    height: 2,
    marginTop: -1,
    backgroundColor: colors.levelB,
  },

  hint: {
    marginTop: 24,
    maxWidth: 300,
    textAlign: 'center',
    fontSize: typography.body,
    lineHeight: 24,
    color: colors.surface,
  },

  sheet: {
    padding: spacing.xl,
    gap: spacing.lg,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },

  sheetText: {
    gap: 4,
  },

  sheetTitle: {
    fontSize: typography.subheading,
    fontWeight: '500',
    color: colors.primaryDark,
  },

  sheetDesc: {
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
});
