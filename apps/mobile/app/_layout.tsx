import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { COLORS } from "@spot/shared";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.bgSecondary },
          headerTintColor: COLORS.textPrimary,
          contentStyle: { backgroundColor: COLORS.bgPrimary },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="spot/[id]" options={{ title: "Spot" }} />
      </Stack>
    </>
  );
}
