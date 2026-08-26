import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS } from "@spot/shared";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";

export default function ProfileScreen() {
  const { session, signOut } = useAuth();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    supabase
      .from("users")
      .select("username")
      .eq("id", session.user.id)
      .single()
      .then(({ data }) => setUsername(data?.username ?? null));
  }, [session]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{username ?? session?.user.email}</Text>
      <Text style={styles.text}>{session?.user.email}</Text>

      <Pressable style={styles.button} onPress={signOut}>
        <Text style={styles.buttonText}>Abmelden</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary, alignItems: "center", justifyContent: "center", gap: 8, padding: 24 },
  title: { color: COLORS.textPrimary, fontSize: 20, fontWeight: "700" },
  text: { color: COLORS.textSecondary },
  button: {
    marginTop: 24,
    backgroundColor: COLORS.bgCard,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  buttonText: { color: COLORS.scoreLow, fontWeight: "700" },
});
