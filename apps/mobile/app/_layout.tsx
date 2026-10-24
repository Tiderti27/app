import { useEffect } from "react";
import * as Linking from "expo-linking";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider, useAuth } from "@/context/auth-context";
import { ThemeProvider, useTheme } from "@/context/theme-context";
import { parseRecoveryLink } from "@/lib/parse-recovery-link";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}

function RootNavigator() {
  const { session, loading, recoveryMode, setRecoveryMode, setSessionFromTokens } = useAuth();
  const { colors, mode } = useTheme();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!session && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (session && inAuthGroup && !recoveryMode) {
      router.replace("/(tabs)");
    }
  }, [session, loading, segments, router, recoveryMode]);

  useEffect(() => {
    async function handleUrl(url: string | null) {
      if (!url) return;
      const tokens = parseRecoveryLink(url);
      if (!tokens) return;
      setRecoveryMode(true);
      await setSessionFromTokens(tokens.accessToken, tokens.refreshToken);
      router.replace("/(auth)/reset-password");
    }

    Linking.getInitialURL().then(handleUrl);
    const subscription = Linking.addEventListener("url", (event) => handleUrl(event.url));
    return () => subscription.remove();
  }, [router, setRecoveryMode, setSessionFromTokens]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bgPrimary, alignItems: "center", justifyContent: "center" }}>
        <StatusBar style={mode === "light" ? "dark" : "light"} />
        <ActivityIndicator color={colors.accentPrimary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={mode === "light" ? "dark" : "light"} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bgSecondary },
          headerTintColor: colors.textPrimary,
          contentStyle: { backgroundColor: colors.bgPrimary },
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="spot/[id]" options={{ title: "Spot" }} />
      </Stack>
    </>
  );
}
