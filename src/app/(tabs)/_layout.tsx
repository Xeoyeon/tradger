import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { useUnistyles } from 'react-native-unistyles';

type IconName = ComponentProps<typeof Ionicons>['name'];

const TABS: { name: string; title: string; icon: IconName }[] = [
  { name: 'index', title: '홈', icon: 'wallet-outline' },
  { name: 'transactions', title: '거래', icon: 'receipt-outline' },
  { name: 'exchanges', title: '환전', icon: 'swap-horizontal-outline' },
  { name: 'settings', title: '설정', icon: 'settings-outline' },
];

export default function TabsLayout() {
  const { theme } = useUnistyles();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
      }}
    >
      {TABS.map(({ name, title, icon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarIcon: ({ color, size }) => <Ionicons name={icon} color={color} size={size} />,
          }}
        />
      ))}
    </Tabs>
  );
}
