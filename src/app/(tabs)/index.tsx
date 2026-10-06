import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { formatMoney, formatRate } from '@/shared/lib/format';
import { Screen } from '@/shared/ui/Screen';

// 홈: 원화 총 지출, 통화별 합계, 지갑별 남은 외화 (02 문서 V-31).
// 지금은 계산 모듈이 연결됐는지 보여주는 예시 값만 표시한다.
export default function HomeScreen() {
  return (
    <Screen title="Tradger" description="외화와 원화를 함께 보는 여행 가계부">
      <View style={styles.card}>
        <Text style={styles.label}>원화 환산 총 지출</Text>
        <Text style={styles.total}>{formatMoney(35190, 'KRW')}</Text>
        <Text style={styles.detail}>
          {formatMoney(2550, 'USD')} · {formatRate('1380', 'USD')}
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    gap: theme.space(2),
    padding: theme.space(5),
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  label: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
  },
  total: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '700',
    color: theme.colors.text,
  },
  detail: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
  },
}));
