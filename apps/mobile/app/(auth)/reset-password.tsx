import { useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { ColorPalette } from "@spot/shared";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { ArrowRightIcon, LockIcon, PinIcon } from "@/components/icons";

export default function ResetPasswordScreen() {
  const { updatePassword, setRecoveryMode } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    if (password.length < 6) {
      setError("Mindestens 6 Zeichen.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }
    setSubmitting(true);
    const { error: updateError } = await updatePassword(password);
    setSubmitting(false);
    if (updateError) {
      setError(updateError);
      return;
    }
    setRecoveryMode(false);
    router.replace("/(tabs)");
  }

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.brandRow}>
          <PinIcon size={22} color={colors.accentPrimary} />
          <Text style={styles.brand}>Spot</Text>
        </View>

        <View style={styles.headingGroup}>
          <Text style={styles.title}>Neues Passwort</Text>
          <Text style={styles.subtitle}>Leg ein neues Passwort für dein Konto fest.</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Neues Passwort</Text>
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

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Passwort bestätigen</Text>
            <View style={styles.inputGroup}>
              <LockIcon size={18} color={colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable style={styles.button} onPress={handleSubmit} disabled={submitting}>
            {submitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Text style={styles.buttonText}>Passwort speichern</Text>
                <ArrowRightIcon size={17} color="#ffffff" />
              </>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bgPrimary },
    inner: { flex: 1, padding: 28, paddingTop: 70, gap: 28 },
    brandRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    brand: { fontSize: 20, fontWeight: "800", color: colors.textPrimary, letterSpacing: -0.2 },
    headingGroup: { gap: 8 },
    title: { color: colors.textPrimary, fontSize: 26, fontWeight: "800", letterSpacing: -0.2 },
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
      marginTop: 6,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.accentPrimary,
      borderRadius: 14,
      padding: 16,
    },
    buttonText: { color: "#ffffff", fontWeight: "700", fontSize: 15 },
    error: { color: colors.scoreLow },
  });
}
