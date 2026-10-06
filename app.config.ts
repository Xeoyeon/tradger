import type { ExpoConfig } from 'expo/config';

// `npx eas-cli@latest init` 실행 후 출력되는 프로젝트 ID를 넣는다.
// 비밀 값이 아니므로 코드에 그대로 둔다 (.env에 두면 EAS 클라우드 빌드에 전달되지 않을 수 있다).
const EAS_PROJECT_ID = '';

// 앱 고유 ID. 첫 iOS 빌드 전에 확정한다. 스토어에 올린 뒤에는 바꿀 수 없다.
const APP_ID = 'com.tradger.app';

const config: ExpoConfig = {
  name: 'Tradger',
  slug: 'tradger',
  scheme: 'tradger',
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  ios: {
    bundleIdentifier: APP_ID,
    supportsTablet: false,
  },
  android: {
    package: APP_ID,
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
  ...(EAS_PROJECT_ID
    ? {
        updates: { url: `https://u.expo.dev/${EAS_PROJECT_ID}` },
        extra: { eas: { projectId: EAS_PROJECT_ID } },
      }
    : {}),
};

export default config;
