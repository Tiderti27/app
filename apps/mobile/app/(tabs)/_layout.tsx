import { Tabs } from "expo-router";
import { COLORS } from "@spot/shared";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.bgSecondary },
        headerTintColor: COLORS.textPrimary,
        tabBarStyle: { backgroundColor: COLORS.bgSecondary, borderTopColor: COLORS.border },
        tabBarActiveTintColor: COLORS.accentPrimary,
        tabBarInactiveTintColor: COLORS.textSecondary,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Karte" }} />
      <Tabs.Screen name="saves" options={{ title: "Merkliste" }} />
      <Tabs.Screen name="profile" options={{ title: "Profil" }} />
    </Tabs>
  );
}
