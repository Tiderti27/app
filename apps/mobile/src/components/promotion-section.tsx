import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import type { ColorPalette } from "@spot/shared";
import { useRedemption } from "@/hooks/use-redemption";
import { GiftIcon } from "@/components/icons";

function formatCountdown(msRemaining: number): string {
  const totalSeconds = Math.max(0, Math.floor(msRemaining / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function PromotionSection({ spotId, colors }: { spotId: string; colors: ColorPalette }) {
  const styles = createStyles(colors);
  const { promotionActive, checking, redemption, redeeming, error, redeem, reset } = useRedemption(spotId);
  const [code, setCode] = useState("");
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!redemption) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [redemption]);

  if (checking || !promotionActive) return null;

  const expiresAt = redemption ? new Date(redemption.qr_expires_at).getTime() : 0;
  const msRemaining = expiresAt - now;
  const expired = redemption !== null && msRemaining <= 0;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <GiftIcon size={16} color={colors.accentPrimary} />
        <Text style={styles.title}>Aktion verfügbar</Text>
      </View>

      {!redemption && (
        <>
          <Text style={styles.hint}>
            Kennst du den Code aus einem Video? Gib ihn hier ein, um deinen persönlichen Rabatt-Code zu erhalten.
          </Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Code eingeben"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="characters"
              value={code}
              onChangeText={setCode}
            />
            <Pressable style={styles.submitButton} onPress={() => redeem(code)} disabled={redeeming}>
              {redeeming ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.submitButtonText}>Einlösen</Text>}
            </Pressable>
          </View>
          {error && <Text style={styles.error}>{error}</Text>}
        </>
      )}

      {redemption && !expired && (
        <View style={styles.qrWrap}>
          <View style={styles.qrCard}>
            <QRCode value={redemption.qr_token} size={160} backgroundColor="#ffffff" />
          </View>
          <Text style={styles.fallbackLabel}>Fallback-Nummer (falls kein Scanner vorhanden)</Text>
          <Text style={styles.fallbackCode}>{redemption.fallback_code}</Text>
          <Text style={styles.countdown}>Gültig noch {formatCountdown(msRemaining)} Min.</Text>
        </View>
      )}

      {redemption && expired && (
        <View style={styles.qrWrap}>
          <Text style={styles.error}>Dein Code ist abgelaufen.</Text>
          <Pressable style={styles.submitButton} onPress={reset}>
            <Text style={styles.submitButtonText}>Erneut einlösen</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    section: {
      gap: 12,
      backgroundColor: colors.bgCard,
      borderColor: colors.border,
      borderWidth: 1.5,
      borderRadius: 16,
      padding: 16,
    },
    header: { flexDirection: "row", alignItems: "center", gap: 8 },
    title: { color: colors.textPrimary, fontSize: 15, fontWeight: "700" },
    hint: { color: colors.textSecondary, fontSize: 12.5, lineHeight: 18 },
    inputRow: { flexDirection: "row", gap: 8 },
    input: {
      flex: 1,
      backgroundColor: colors.bgElevated,
      borderColor: colors.border,
      borderWidth: 1.5,
      borderRadius: 11,
      paddingHorizontal: 13,
      paddingVertical: 11,
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: "700",
      letterSpacing: 1,
    },
    submitButton: {
      backgroundColor: colors.accentPrimary,
      borderRadius: 11,
      paddingHorizontal: 18,
      alignItems: "center",
      justifyContent: "center",
    },
    submitButtonText: { color: "#ffffff", fontWeight: "700", fontSize: 13.5 },
    error: { color: colors.scoreLow, fontSize: 12.5 },
    qrWrap: { alignItems: "center", gap: 8, paddingVertical: 8 },
    qrCard: { backgroundColor: "#ffffff", padding: 14, borderRadius: 14 },
    fallbackLabel: { color: colors.textSecondary, fontSize: 11, marginTop: 6 },
    fallbackCode: { color: colors.textPrimary, fontSize: 22, fontWeight: "800", letterSpacing: 4 },
    countdown: { color: colors.scoreMid, fontSize: 12.5, fontWeight: "700" },
  });
}
