import { useState } from "react";
import { Link } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { COLORS } from "@spot/shared";
import { useAuth } from "@/context/auth-context";

export default function LoginScreen() {
  const { signIn } = useAuth();
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
        placeholderTextColor={COLORS.textSecondary}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Passwort"
        placeholderTextColor={COLORS.textSecondary}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={styles.button} onPress={handleSubmit} disabled={submitting}>
        {submitting ? <ActivityIndicator color={COLORS.textPrimary} /> : <Text style={styles.buttonText}>Anmelden</Text>}
      </Pressable>

      <Link href="/(auth)/register" style={styles.link}>
        Noch kein Konto? Registrieren
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary, padding: 24, justifyContent: "center", gap: 12 },
  title: { color: COLORS.textPrimary, fontSize: 24, fontWeight: "800", marginBottom: 12 },
  input: {
    backgroundColor: COLORS.bgCard,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    color: COLORS.textPrimary,
  },
  button: {
    backgroundColor: COLORS.accentPrimary,
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: COLORS.textPrimary, fontWeight: "700" },
  error: { color: COLORS.scoreLow },
  link: { color: COLORS.accentSecondary, textAlign: "center", marginTop: 16 },
});
