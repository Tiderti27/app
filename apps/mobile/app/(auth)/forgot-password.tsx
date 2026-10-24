import { useMemo, useState } from "react";
import { Link, useRouter } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { ColorPalette } from "@spot/shared";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { ArrowRightIcon, BackIcon, MailIcon } from "@/components/icons";

export default function ForgotPasswordScreen() {
  const { requestPasswordReset } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    const { error: resetError } = await requestPasswordReset(email.trim());
    setSubmitting(false);
    if (resetError) setError(resetError);
    else setSent(true);
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <BackIcon size={18} color={colors.textPrimary} />
      </Pressable>

      <View style={styles.inner}>
        <View style={styles.headingGroup}>
          <Text style={styles.title}>Passwort vergessen?</Text>
          <Text style={styles.subtitle}>
            Gib deine E-Mail-Adresse ein, wir schicken dir einen Link zum Zurücksetzen.
          </Text>
        </View>

        {sent ? (
          <View style={styles.sentBox}>
            <Text style={styles.sentText}>
              E-Mail verschickt! Prüf dein Postfach (auch den Spam-Ordner) und folge dem Link darin.
            </Text>
            <Link href="/(auth)/login" style={styles.link}>
              Zurück zum Login
            </Link>
          </View>
        ) : (
          <View style={styles.form}>
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

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable style={styles.button} onPress={handleSubmit} disabled={submitting || !email.trim()}>
              {submitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Text style={styles.buttonText}>Link schicken</Text>
                  <ArrowRightIcon size={17} color="#ffffff" />
                </>
              )}
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bgPrimary },
    backButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.bgCard,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 54,
      marginLeft: 20,
    },
    inner: { flex: 1, padding: 28, paddingTop: 20, gap: 28 },
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
    sentBox: { gap: 16, alignItems: "center" },
    sentText: { color: colors.textPrimary, fontSize: 14, lineHeight: 20, textAlign: "center" },
    link: { color: colors.accentPrimary, fontWeight: "700", fontSize: 13.5 },
  });
}
