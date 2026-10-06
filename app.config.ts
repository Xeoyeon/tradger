import type { ExpoConfig } from 'expo/config';

// `eas init` 후 발급되는 프로젝트 ID. OTA 업데이트(EAS Update)에 필요하다.
const easProjectId = process.env.EAS_PROJECT_ID;

const config: ExpoConfig = {
  name: 'Tradger',
  slug: 'tradger',
  scheme: 'tradger',
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  ios: {
    // 출시 전에 실제 사용할 번들 ID로 바꾼다. 스토어 등록 후에는 바꿀 수 없다.
    bundleIdentifier: 'com.tradger.app',
    supportsTablet: false,
  },
  android: {
    package: 'com.tradger.app',
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  plugins: ['expo-router', 'expo-sqlite', 'expo-localization'],
  runtimeVersion: { policy: 'fingerprint' },
  ...(easProjectId && {
    updates: { url: `https://u.expo.dev/${easProjectId}` },
    extra: { eas: { projectId: easProjectId } },
  }),
};

export default config;
