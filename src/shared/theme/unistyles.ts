import { StyleSheet } from 'react-native-unistyles';

// 앱 전체 테마. 기기 설정에 따라 라이트·다크가 자동으로 바뀐다.
// 이 파일은 index.ts에서 가장 먼저 import된다.

const space = (multiplier: number) => multiplier * 4;

const lightTheme = {
  colors: {
    background: '#F7F8FA',
    surface: '#FFFFFF',
    text: '#111827',
    textMuted: '#6B7280',
    border: '#E5E7EB',
    primary: '#2563EB',
    expense: '#DC2626',
    income: '#059669',
    estimated: '#D97706',
  },
  space,
  radius: { sm: 6, md: 12, lg: 20 },
  fontSize: { sm: 13, md: 15, lg: 18, xl: 24, xxl: 32 },
} as const;

const darkTheme = {
  ...lightTheme,
  colors: {
    background: '#0B0F17',
    surface: '#151B26',
    text: '#F3F4F6',
    textMuted: '#9CA3AF',
    border: '#273042',
    primary: '#60A5FA',
    expense: '#F87171',
    income: '#34D399',
    estimated: '#FBBF24',
  },
} as const;

const appThemes = {
  light: lightTheme,
  dark: darkTheme,
};

type AppThemes = typeof appThemes;

declare module 'react-native-unistyles' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface UnistylesThemes extends AppThemes {}
}

StyleSheet.configure({
  themes: appThemes,
  settings: { adaptiveThemes: true },
});
