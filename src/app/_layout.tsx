import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { db } from '@/core/db/client';
import migrations from '@/core/db/migrations/migrations';

export default function RootLayout() {
  // 앱 시작 시 로컬 DB 스키마를 최신으로 맞춘다 (02 문서 V-41).
  const { success, error } = useMigrations(db, migrations);

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>데이터를 준비하지 못했어요</Text>
        <Text style={styles.errorMessage}>{error.message}</Text>
      </View>
    );
  }

  if (!success) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space(2),
    padding: theme.space(6),
    backgroundColor: theme.colors.background,
  },
  errorTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text,
  },
  errorMessage: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
}));
