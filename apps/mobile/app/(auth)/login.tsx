import { useMemo, useState } from "react";
import { Link } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { ColorPalette } from "@spot/shared";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    const { error: signInError } = await signIn(email.trim(), password);
    setSubmitting(false);
    if (signInError) setError(signInError);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Willkommen zurueck</Text>

      <TextInput
        style={styles.input}
        placeholder="E-Mail"
        placeholderTextColor={colors.textSecondary}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Passwort"
        placeholderTextColor={colors.textSecondary}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={styles.button} onPress={handleSubmit} disabled={submitting}>
        {submitting ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>Anmelden</Text>}
      </Pressable>

      <Link href="/(auth)/register" style={styles.link}>
        Noch kein Konto? Registrieren
      </Link>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bgPrimary, padding: 24, justifyContent: "center", gap: 12 },
    title: { color: colors.textPrimary, fontSize: 24, fontWeight: "800", marginBottom: 12 },
    input: {
      backgroundColor: colors.bgCard,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 10,
      padding: 14,
      color: colors.textPrimary,
    },
    button: {
      backgroundColor: colors.accentPrimary,
      borderRadius: 10,
      padding: 14,
      alignItems: "center",
      marginTop: 8,
    },
    buttonText: { color: "#ffffff", fontWeight: "700" },
    error: { color: colors.scoreLow },
    link: { color: colors.accentSecondary, textAlign: "center", marginTop: 16 },
  });
}
