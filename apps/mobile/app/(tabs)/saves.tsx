import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "@spot/shared";

// TODO: supabase.from("saves").select(...).eq("user_id", currentUser.id)
export default function SavesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Noch keine gespeicherten Spots.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary, alignItems: "center", justifyContent: "center" },
  text: { color: COLORS.textSecondary },
});
