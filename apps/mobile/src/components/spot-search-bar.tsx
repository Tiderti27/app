import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import type { ColorPalette } from "@spot/shared";
import { useSpotSearch } from "@/hooks/use-spot-search";
import { SearchIcon } from "@/components/icons";

export function SpotSearchBar({ colors }: { colors: ColorPalette }) {
  const styles = createStyles(colors);
  const router = useRouter();
  const { results, loading, linkNotFound, noTextResults, search, clear } = useSpotSearch();
  const [query, setQuery] = useState("");

  async function handleSubmit() {
    const { matchedSpotId } = await search(query);
    if (matchedSpotId) {
      setQuery("");
      clear();
      router.push(`/spot/${matchedSpotId}`);
    }
  }

  function handleSelect(spotId: string) {
    setQuery("");
    clear();
    router.push(`/spot/${spotId}`);
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <SearchIcon size={16} color={colors.textSecondary} />
        <TextInput
          style={styles.input}
          placeholder="Spot suchen oder TikTok/Insta-Link einfügen"
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="none"
          value={query}
          onChangeText={(value) => {
            setQuery(value);
            if (!value.trim()) clear();
          }}
          onSubmitEditing={handleSubmit}
          returnKeyType="search"
        />
        {loading && <ActivityIndicator size="small" color={colors.accentPrimary} />}
      </View>

      {linkNotFound && <Text style={styles.hint}>Zu diesem Link wurde kein verknüpfter Spot gefunden.</Text>}
      {noTextResults && <Text style={styles.hint}>Keine Spots mit diesem Namen gefunden.</Text>}

      {results.length > 0 && (
        <View style={styles.resultsBox}>
          {results.map((result) => (
            <Pressable key={result.id} style={styles.resultRow} onPress={() => handleSelect(result.id)}>
              <Text style={styles.resultText} numberOfLines={1}>
                {result.name} <Text style={styles.resultCity}>· {result.city}</Text>
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    container: { paddingHorizontal: 20, position: "relative", zIndex: 20 },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: colors.bgCard,
      borderColor: colors.border,
      borderWidth: 1.5,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 11,
    },
    input: { flex: 1, color: colors.textPrimary, fontSize: 14 },
    hint: { color: colors.textSecondary, fontSize: 12, marginTop: 6 },
    resultsBox: {
      marginTop: 6,
      backgroundColor: colors.bgElevated,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      overflow: "hidden",
    },
    resultRow: { paddingHorizontal: 14, paddingVertical: 11 },
    resultText: { color: colors.textPrimary, fontSize: 13.5, fontWeight: "600" },
    resultCity: { color: colors.textSecondary, fontWeight: "400" },
  });
}
