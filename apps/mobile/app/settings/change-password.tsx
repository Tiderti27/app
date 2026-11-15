import { useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { ColorPalette } from "@spot/shared";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { BackIcon, LockIcon } from "@/components/icons";

export default function ChangePasswordScreen() {
  const { updatePassword } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

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
    if (updateError) setError(updateError);
    else setDone(true);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <BackIcon size={18} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Passwort ändern</Text>
        <View style={{ width: 38 }} />
      </View>

      {done ? (
        <View style={styles.doneBox}>
          <Text style={styles.doneText}>Passwort erfolgreich geändert.</Text>
          <Pressable style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Zurück zu Einstellungen</Text>
          </Pressable>
        </View>
      ) : (
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
            {submitting ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>Passwort speichern</Text>}
          </Pressable>
        </View>
      )}
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bgPrimary },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 48, paddingHorizontal: 20 },
    backButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.bgCard,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: { color: colors.textPrimary, fontSize: 17, fontWeight: "800" },
    form: { padding: 20, gap: 14 },
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
    error: { color: colors.scoreLow },
    button: {
      marginTop: 6,
      backgroundColor: colors.accentPrimary,
      borderRadius: 14,
      paddingVertical: 15,
      alignItems: "center",
    },
    buttonText: { color: "#ffffff", fontWeight: "700", fontSize: 15 },
    doneBox: { padding: 28, gap: 18, alignItems: "center" },
    doneText: { color: colors.textPrimary, fontSize: 14.5, textAlign: "center" },
  });
}
