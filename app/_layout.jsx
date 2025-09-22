import { Tabs } from 'expo-router';

export default function Layout() {
  return (
    <Tabs screenOptions={{ headerTitleAlign: 'center' }}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="add" options={{ title: 'Add' }} />
      {/* Tab edit tidak perlu karena rute dinamis berada di /edit/[id] dan dibuka via router.push */}
      <Tabs.Screen name="progress" options={{ title: 'Progress (opsional)' }} />
    </Tabs>
  );
}