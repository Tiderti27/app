import { Tabs } from "expo-router";
import { useTheme } from "@/context/theme-context";
import { MapIcon, BookmarkIcon, UserIcon } from "@/components/icons";

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.bgSecondary },
        headerTintColor: colors.textPrimary,
        tabBarStyle: { backgroundColor: colors.bgSecondary, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.accentPrimary,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Karte", tabBarIcon: ({ color }) => <MapIcon size={21} color={color as string} /> }}
      />
      <Tabs.Screen
        name="saves"
        options={{ title: "Merkliste", tabBarIcon: ({ color }) => <BookmarkIcon size={21} color={color as string} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Profil", tabBarIcon: ({ color }) => <UserIcon size={21} color={color as string} /> }}
      />
    </Tabs>
  );
}
