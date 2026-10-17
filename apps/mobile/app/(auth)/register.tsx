import { useMemo, useState } from "react";
import { Link } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { ColorPalette } from "@spot/shared";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { MailIcon, LockIcon, PinIcon } from "@/components/icons";

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
      <View style={styles.brandRow}>
        <PinIcon size={20} color={colors.accentPrimary} />
        <Text style={styles.brand}>Spot</Text>
      </View>

      <View style={styles.headingGroup}>
        <Text style={styles.title}>Konto{"\n"}erstellen</Text>
        <Text style={styles.subtitle}>Leg dir ein Konto an, um Orte zu bewerten und zu speichern.</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Nutzername</Text>
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="dein_name"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>E-Mail</Text>
          <View style={styles.inputGroup}>
            <MailIcon size={18} color={colors.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="deine@email.de"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Passwort</Text>
          <View style={styles.inputGroup}>
            <LockIcon size={18} color={colors.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {info ? <Text style={styles.info}>{info}</Text> : null}

        <Pressable style={styles.button} onPress={handleSubmit} disabled={submitting}>
          {submitting ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>Registrieren</Text>}
        </Pressable>
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.footerText}>Schon ein Konto?</Text>
        <Link href="/(auth)/login" style={styles.link}>
          Anmelden
        </Link>
      </View>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bgPrimary, padding: 24, justifyContent: "center", gap: 28 },
    brandRow: { flexDirection: "row", alignItems: "center", gap: 7, position: "absolute", top: 60, left: 24 },
    brand: { fontSize: 17, fontWeight: "800", color: colors.textPrimary },
    headingGroup: { gap: 8 },
    title: { color: colors.textPrimary, fontSize: 28, fontWeight: "800", lineHeight: 33 },
    subtitle: { color: colors.textSecondary, fontSize: 14, lineHeight: 20 },
    form: { gap: 14 },
    fieldGroup: { gap: 6 },
    fieldLabel: { color: colors.textSecondary, fontSize: 11, fontWeight: "700", letterSpacing: 0.5, textTransform: "uppercase" },
    inputGroup: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: colors.bgCard,
      borderColor: colors.border,
      borderWidth: 1.5,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 13,
    },
    input: { flex: 1, color: colors.textPrimary, fontSize: 15 },
    button: {
      marginTop: 4,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.accentPrimary,
      borderRadius: 14,
      padding: 16,
    },
    buttonText: { color: "#ffffff", fontWeight: "700", fontSize: 15 },
    error: { color: colors.scoreLow },
    info: { color: colors.scoreHigh },
    footerRow: { flexDirection: "row", justifyContent: "center", gap: 6 },
    footerText: { color: colors.textSecondary, fontSize: 13.5 },
    link: { color: colors.accentPrimary, fontWeight: "700", fontSize: 13.5 },
  });
}
