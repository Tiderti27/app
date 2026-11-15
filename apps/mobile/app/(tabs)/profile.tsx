import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { ColorPalette, UserRole } from "@spot/shared";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { supabase } from "@/lib/supabase";
import { ActivitySection } from "@/components/activity-section";
import { CreatorPanel } from "@/components/creator-panel";
import { CreatorApplicationSection } from "@/components/creator-application-section";
import { GearIcon } from "@/components/icons";

export default function ProfileScreen() {
  const { session } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
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
        <Pressable style={styles.settingsButton} onPress={() => router.push("/settings")}>
          <GearIcon size={18} color={colors.textSecondary} />
        </Pressable>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(username ?? session?.user.email ?? "?").charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.title}>{username ?? session?.user.email}</Text>
        <Text style={styles.text}>{session?.user.email}</Text>
      </View>

      <ActivitySection colors={colors} />

      {role === "creator" && <CreatorPanel colors={colors} />}

      {role === "consumer" && <CreatorApplicationSection colors={colors} />}
    </ScrollView>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bgPrimary },
    content: { padding: 24, paddingBottom: 40, gap: 24 },
    header: { alignItems: "center", gap: 6, marginTop: 12, position: "relative" },
    settingsButton: {
      position: "absolute",
      right: 0,
      top: -4,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.bgCard,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
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
  });
}
