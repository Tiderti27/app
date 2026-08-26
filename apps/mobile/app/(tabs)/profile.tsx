import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "@spot/shared";

// TODO: Auth-Status aus supabase.auth.getUser(), Rollen-Umschaltung
// (Nutzer / Creator) gemaess docs/spec.md Abschnitt 7.1.
export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profil</Text>
      <Text style={styles.text}>Noch nicht angemeldet.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary, alignItems: "center", justifyContent: "center", gap: 8 },
  title: { color: COLORS.textPrimary, fontSize: 20, fontWeight: "700" },
  text: { color: COLORS.textSecondary },
});
