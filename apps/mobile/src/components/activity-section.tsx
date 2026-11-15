import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import type { ColorPalette } from "@spot/shared";
import { scoreColor } from "@spot/shared";
import { useProfileActivity } from "@/hooks/use-profile-activity";

const STATUS_LABEL: Record<string, string> = {
  generated: "Offen",
  redeemed: "Eingelöst",
  expired: "Abgelaufen",
};

function formatDiscount(type: "percent" | "fixed", value: number): string {
  return type === "percent" ? `${value}%` : `${value.toFixed(2)} €`;
}

export function ActivitySection({ colors }: { colors: ColorPalette }) {
  const styles = createStyles(colors);
  const { ratings, redemptions, loading } = useProfileActivity();

  if (loading) {
    return <ActivityIndicator color={colors.accentPrimary} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Meine Bewertungen</Text>
        {ratings.length === 0 && <Text style={styles.emptyText}>Noch keine Bewertung abgegeben.</Text>}
        {ratings.map((rating) => (
          <View key={rating.id} style={styles.row}>
            <Text style={styles.rowLabel} numberOfLines={1}>
              {rating.spot_name}
            </Text>
            <Text style={[styles.rowValue, { color: scoreColor(rating.score, colors) }]}>{rating.score}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Eingelöste Rabatte</Text>
        {redemptions.length === 0 && <Text style={styles.emptyText}>Noch keinen Rabatt eingelöst.</Text>}
        {redemptions.map((redemption) => (
          <View key={redemption.id} style={styles.row}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.rowLabel} numberOfLines={1}>
                {redemption.spot_name}
              </Text>
              <Text style={styles.rowMeta}>{formatDiscount(redemption.discount_type, redemption.discount_value)}</Text>
            </View>
            <Text style={styles.statusBadge}>{STATUS_LABEL[redemption.status] ?? redemption.status}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    container: { gap: 20 },
    section: { gap: 10 },
    sectionLabel: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 0.04,
      textTransform: "uppercase",
    },
    emptyText: { color: colors.textSecondary, fontSize: 12.5 },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      backgroundColor: colors.bgCard,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    rowLabel: { color: colors.textPrimary, fontSize: 13.5, fontWeight: "600", flexShrink: 1 },
    rowMeta: { color: colors.textSecondary, fontSize: 11.5, marginTop: 2 },
    rowValue: { fontSize: 15, fontWeight: "800" },
    statusBadge: { color: colors.textSecondary, fontSize: 11, fontWeight: "700" },
  });
}
