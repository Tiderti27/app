import { Stack } from "expo-router";
import { COLORS } from "@spot/shared";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.bgSecondary },
        headerTintColor: COLORS.textPrimary,
        contentStyle: { backgroundColor: COLORS.bgPrimary },
      }}
    >
      <Stack.Screen name="login" options={{ title: "Anmelden" }} />
      <Stack.Screen name="register" options={{ title: "Registrieren" }} />
    </Stack>
  );
}
