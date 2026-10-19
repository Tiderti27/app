import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import type { ColorPalette, UserRole } from "@spot/shared";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { supabase } from "@/lib/supabase";
import { ActivitySection } from "@/components/activity-section";
import { CreatorPanel } from "@/components/creator-panel";
import { CreatorApplicationSection } from "@/components/creator-application-section";

export default function ProfileScreen() {
  const { session, signOut } = useAuth();
  const { colors, mode, toggleMode } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);

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

      {role === "consumer" && <CreatorApplicationSection colors={colors} />}

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
