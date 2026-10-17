import { useMemo, useState } from "react";
import { Link } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { ColorPalette } from "@spot/shared";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    setInfo(null);

    if (!username.trim()) {
      setError("Bitte einen Nutzernamen angeben.");
      return;
    }
    if (password.length < 6) {
      setError("Das Passwort muss mindestens 6 Zeichen haben.");
      return;
    }

    setSubmitting(true);
    const { error: signUpError } = await signUp(email.trim(), password, username.trim());
    setSubmitting(false);

    if (signUpError) {
      setError(signUpError);
    } else {
      setInfo("Konto erstellt. Du kannst dich jetzt anmelden (ggf. E-Mail bestaetigen).");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Konto erstellen</Text>

      <TextInput
        style={styles.input}
        placeholder="Nutzername"
        placeholderTextColor={colors.textSecondary}
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
      />
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
      {info ? <Text style={styles.info}>{info}</Text> : null}

      <Pressable style={styles.button} onPress={handleSubmit} disabled={submitting}>
        {submitting ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>Registrieren</Text>}
      </Pressable>

      <Link href="/(auth)/login" style={styles.link}>
        Schon ein Konto? Anmelden
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
    info: { color: colors.scoreHigh },
    link: { color: colors.accentSecondary, textAlign: "center", marginTop: 16 },
  });
}
