import { Stack } from "expo-router";
import { useTheme } from "@/context/theme-context";

export default function AuthLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bgSecondary },
        headerTintColor: colors.textPrimary,
        contentStyle: { backgroundColor: colors.bgPrimary },
      }}
    >
      <Stack.Screen name="login" options={{ title: "Anmelden" }} />
      <Stack.Screen name="register" options={{ title: "Registrieren" }} />
    </Stack>
  );
}
