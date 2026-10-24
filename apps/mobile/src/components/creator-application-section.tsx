import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { ColorPalette } from "@spot/shared";
import { useCreatorApplication } from "@/hooks/use-creator-application";

export function CreatorApplicationSection({ colors }: { colors: ColorPalette }) {
  const styles = createStyles(colors);
  const { application, loading, submitting, error, submit } = useCreatorApplication(true);

  const [tiktok, setTiktok] = useState("");
  const [instagram, setInstagram] = useState("");
  const [youtube, setYoutube] = useState("");
  const [message, setMessage] = useState("");

  if (loading) {
    return <ActivityIndicator color={colors.accentPrimary} />;
  }

  if (application && application.status === "pending") {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Creator-Bewerbung eingereicht</Text>
        <Text style={styles.text}>Deine Bewerbung wird geprüft. Du bekommst Zugriff, sobald sie freigegeben wurde.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Du erstellst Content über Orte?</Text>
      <Text style={styles.text}>
        Bewirb dich als Creator mit deinen Social-Media-Accounts. Ein Spot-Team-Mitglied prüft deine Bewerbung.
      </Text>

      {application?.status === "rejected" && (
        <Text style={styles.rejected}>Deine letzte Bewerbung wurde abgelehnt. Du kannst dich erneut bewerben.</Text>
      )}

      <TextInput
        style={styles.input}
        placeholder="TikTok-Handle"
        placeholderTextColor={colors.textSecondary}
        autoCapitalize="none"
        value={tiktok}
        onChangeText={setTiktok}
      />
      <TextInput
        style={styles.input}
        placeholder="Instagram-Handle"
        placeholderTextColor={colors.textSecondary}
        autoCapitalize="none"
        value={instagram}
        onChangeText={setInstagram}
      />
      <TextInput
        style={styles.input}
        placeholder="YouTube-Kanal"
        placeholderTextColor={colors.textSecondary}
        autoCapitalize="none"
        value={youtube}
        onChangeText={setYoutube}
      />
      <TextInput
        style={styles.input}
        placeholder="Kurze Nachricht (optional)"
        placeholderTextColor={colors.textSecondary}
        value={message}
        onChangeText={setMessage}
      />

      {error && <Text style={styles.rejected}>{error}</Text>}

      <Pressable
        style={styles.button}
        onPress={() => submit({ tiktok, instagram, youtube, message })}
        disabled={submitting}
      >
        {submitting ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>Bewerbung absenden</Text>}
      </Pressable>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    container: {
      backgroundColor: colors.bgCard,
      borderWidth: 1.5,
      borderColor: colors.accentPrimary,
      borderRadius: 16,
      padding: 16,
      gap: 10,
    },
    title: { color: colors.textPrimary, fontSize: 14.5, fontWeight: "700" },
    text: { color: colors.textSecondary, fontSize: 12.5, lineHeight: 18 },
    rejected: { color: colors.scoreLow, fontSize: 12 },
    input: {
      backgroundColor: colors.bgElevated,
      borderColor: colors.border,
      borderWidth: 1.5,
      borderRadius: 10,
      paddingHorizontal: 13,
      paddingVertical: 11,
      color: colors.textPrimary,
      fontSize: 13.5,
    },
    button: {
      backgroundColor: colors.accentPrimary,
      borderRadius: 10,
      paddingVertical: 11,
      alignItems: "center",
    },
    buttonText: { color: "#ffffff", fontWeight: "700", fontSize: 13.5 },
  });
}
