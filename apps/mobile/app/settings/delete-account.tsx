import { useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { ColorPalette } from "@spot/shared";
import { useTheme } from "@/context/theme-context";
import { useSettings } from "@/hooks/use-settings";
import { BackIcon } from "@/components/icons";

export default function DeleteAccountScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { requestAccountDeletion } = useSettings();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    const { error: submitError } = await requestAccountDeletion(reason);
    setSubmitting(false);
    if (submitError) setError(submitError);
    else setDone(true);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <BackIcon size={18} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Konto löschen</Text>
        <View style={{ width: 38 }} />
      </View>

      {done ? (
        <View style={styles.doneBox}>
          <Text style={styles.doneTitle}>Anfrage gesendet</Text>
          <Text style={styles.doneText}>
            Deine Löschanfrage wurde übermittelt und wird von unserem Team bearbeitet. Du erhältst eine Bestätigung,
            sobald dein Konto gelöscht wurde.
          </Text>
          <Pressable style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Zurück zu Einstellungen</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.form}>
          <Text style={styles.warning}>
            Dein Konto, deine Bewertungen, gespeicherten Spots und (falls vorhanden) dein Creator- oder Laden-Profil
            werden dauerhaft gelöscht. Das kann nicht rückgängig gemacht werden.
          </Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Grund (optional)</Text>
            <TextInput
              style={styles.textarea}
              placeholder="Magst du uns sagen, warum du gehst?"
              placeholderTextColor={colors.textSecondary}
              multiline
              value={reason}
              onChangeText={setReason}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable style={styles.dangerButton} onPress={handleSubmit} disabled={submitting}>
            {submitting ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.dangerButtonText}>Löschung beantragen</Text>}
          </Pressable>
          <Pressable style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={styles.cancelButtonText}>Abbrechen</Text>
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
    form: { padding: 20, gap: 16 },
    warning: { color: colors.textSecondary, fontSize: 13.5, lineHeight: 20 },
    fieldGroup: { gap: 6 },
    fieldLabel: { color: colors.textSecondary, fontSize: 11, fontWeight: "700", letterSpacing: 0.5, textTransform: "uppercase" },
    textarea: {
      backgroundColor: colors.bgCard,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 12,
      padding: 12,
      color: colors.textPrimary,
      minHeight: 90,
      textAlignVertical: "top",
    },
    error: { color: colors.scoreLow },
    dangerButton: { backgroundColor: colors.scoreLow, borderRadius: 14, paddingVertical: 15, alignItems: "center" },
    dangerButtonText: { color: "#ffffff", fontWeight: "700", fontSize: 15 },
    cancelButton: { alignItems: "center", paddingVertical: 10 },
    cancelButtonText: { color: colors.textSecondary, fontWeight: "600", fontSize: 13.5 },
    doneBox: { padding: 28, gap: 14, alignItems: "center" },
    doneTitle: { color: colors.textPrimary, fontSize: 17, fontWeight: "800" },
    doneText: { color: colors.textSecondary, fontSize: 13.5, textAlign: "center", lineHeight: 20 },
    button: {
      marginTop: 6,
      backgroundColor: colors.accentPrimary,
      borderRadius: 14,
      paddingVertical: 15,
      paddingHorizontal: 24,
      alignItems: "center",
    },
    buttonText: { color: "#ffffff", fontWeight: "700", fontSize: 15 },
  });
}
