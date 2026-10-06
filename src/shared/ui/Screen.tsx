import type { ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

type ScreenProps = {
  title: string;
  description?: string;
  children?: ReactNode;
};

/** 탭 화면 공통 레이아웃 */
export function Screen({ title, description, children }: ScreenProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingTop: rt.insets.top + theme.space(4),
    paddingHorizontal: theme.space(4),
    paddingBottom: theme.space(8),
    gap: theme.space(4),
  },
  header: {
    gap: theme.space(1),
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.text,
  },
  description: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textMuted,
  },
}));
