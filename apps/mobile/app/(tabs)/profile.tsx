import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import type { ColorPalette, UserRole } from "@spot/shared";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { supabase } from "@/lib/supabase";
import { ActivitySection } from "@/components/activity-section";
import { CreatorPanel } from "@/components/creator-panel";

export default function ProfileScreen() {
  const { session, signOut } = useAuth();
  const { colors, mode, toggleMode } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [becomingCreator, setBecomingCreator] = useState(false);

  const loadUser = useCallback(() => {
    if (!session) return;
    supabase
      .from("users")
      .select("username, role")
      .eq("id", session.user.id)
      .single()
      .then(({ data }) => {
        setUsername(data?.username ?? null);
        setRole((data?.role as UserRole | undefined) ?? null);
      });
  }, [session]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  async function becomeCreator() {
    if (!session) return;
    setBecomingCreator(true);
    await supabase.from("users").update({ role: "creator" }).eq("id", session.user.id);
    setBecomingCreator(false);
    loadUser();
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(username ?? session?.user.email ?? "?").charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.title}>{username ?? session?.user.email}</Text>
        <Text style={styles.text}>{session?.user.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Darstellung</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Helles Design</Text>
          <Switch
            value={mode === "light"}
            onValueChange={toggleMode}
            trackColor={{ false: colors.border, true: colors.accentPrimary }}
            thumbColor="#ffffff"
          />
        </View>
      </View>

      <ActivitySection colors={colors} />

      {role === "creator" && <CreatorPanel colors={colors} />}

      {role === "consumer" && (
        <View style={styles.creatorPromo}>
          <Text style={styles.creatorPromoTitle}>Du erstellst Content über Orte?</Text>
          <Text style={styles.creatorPromoText}>
            Werde Creator, verknüpfe deine Videos mit Spots und verdiene an Rabattcode-Einlösungen.
          </Text>
          <Pressable style={styles.creatorPromoButton} onPress={becomeCreator} disabled={becomingCreator}>
            {becomingCreator ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.creatorPromoButtonText}>Werde Creator</Text>
            )}
          </Pressable>
        </View>
      )}

      <Pressable style={styles.button} onPress={signOut}>
        <Text style={styles.buttonText}>Abmelden</Text>
      </Pressable>
    </ScrollView>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bgPrimary },
    content: { padding: 24, paddingBottom: 40, gap: 24 },
    header: { alignItems: "center", gap: 6, marginTop: 12 },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.accentPrimary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 6,
    },
    avatarText: { color: "#ffffff", fontSize: 24, fontWeight: "800" },
    title: { color: colors.textPrimary, fontSize: 18, fontWeight: "700" },
    text: { color: colors.textSecondary },
    section: { gap: 10 },
    sectionLabel: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 0.04,
      textTransform: "uppercase",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.bgCard,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    rowLabel: { color: colors.textPrimary, fontSize: 14, fontWeight: "600" },
    creatorPromo: {
      backgroundColor: colors.bgCard,
      borderWidth: 1.5,
      borderColor: colors.accentPrimary,
      borderRadius: 16,
      padding: 16,
      gap: 10,
    },
    creatorPromoTitle: { color: colors.textPrimary, fontSize: 14.5, fontWeight: "700" },
    creatorPromoText: { color: colors.textSecondary, fontSize: 12.5, lineHeight: 18 },
    creatorPromoButton: {
      backgroundColor: colors.accentPrimary,
      borderRadius: 10,
      paddingVertical: 11,
      alignItems: "center",
    },
    creatorPromoButtonText: { color: "#ffffff", fontWeight: "700", fontSize: 13.5 },
    button: {
      alignSelf: "center",
      backgroundColor: colors.bgCard,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    buttonText: { color: colors.scoreLow, fontWeight: "700" },
  });
}
