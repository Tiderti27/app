import { useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import type { ColorPalette, ReportTargetType } from "@spot/shared";
import { useReports } from "@/hooks/use-reports";
import { BackIcon } from "@/components/icons";

const REASONS = ["Unangemessener Inhalt", "Falsche Informationen", "Spam/Werbung", "Existiert nicht mehr", "Sonstiges"];

export function ReportModal({
  visible,
  spotId,
  photos,
  colors,
  onClose,
}: {
  visible: boolean;
  spotId: string;
  photos: string[];
  colors: ColorPalette;
  onClose: () => void;
}) {
  const { submitReport, submitting } = useReports();
  const styles = createStyles(colors);
  const [targetType, setTargetType] = useState<ReportTargetType>("spot");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setTargetType("spot");
    setPhotoUrl(null);
    setReason(null);
    setNote("");
    setDone(false);
    setError(null);
  }

  async function handleSubmit() {
    if (!reason) return;
    setError(null);
    const fullReason = note.trim() ? `${reason}: ${note.trim()}` : reason;
    const { error: submitError } = await submitReport({
      spotId,
      targetType,
      reason: fullReason,
      photoUrl: targetType === "photo" ? photoUrl : null,
    });
    if (submitError) setError(submitError);
    else setDone(true);
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={() => {
        reset();
        onClose();
      }}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Pressable
              onPress={() => {
                reset();
                onClose();
              }}
            >
              <BackIcon size={18} color={colors.textPrimary} />
            </Pressable>
            <Text style={styles.title}>Melden</Text>
            <View style={{ width: 18 }} />
          </View>

          {done ? (
            <View style={styles.doneBox}>
              <Text style={styles.doneText}>Danke, deine Meldung wurde übermittelt.</Text>
              <Pressable
                style={styles.submitButton}
                onPress={() => {
                  reset();
                  onClose();
                }}
              >
                <Text style={styles.submitButtonText}>Schließen</Text>
              </Pressable>
            </View>
          ) : (
            <ScrollView contentContainerStyle={{ gap: 16 }}>
              <View style={styles.chipRow}>
                <Pressable
                  style={[styles.chip, targetType === "spot" && styles.chipActive]}
                  onPress={() => setTargetType("spot")}
                >
                  <Text style={[styles.chipText, targetType === "spot" && styles.chipTextActive]}>Diesen Spot</Text>
                </Pressable>
                {photos.length > 0 && (
                  <Pressable
                    style={[styles.chip, targetType === "photo" && styles.chipActive]}
                    onPress={() => setTargetType("photo")}
                  >
                    <Text style={[styles.chipText, targetType === "photo" && styles.chipTextActive]}>Ein Foto</Text>
                  </Pressable>
                )}
              </View>

              {targetType === "photo" && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {photos.map((url) => (
                    <Pressable
                      key={url}
                      onPress={() => setPhotoUrl(url)}
                      style={[styles.photoThumbWrap, photoUrl === url && styles.photoThumbWrapActive]}
                    >
                      <View style={[styles.photoThumb, { backgroundColor: colors.bgCard }]} />
                    </Pressable>
                  ))}
                </ScrollView>
              )}

              <View style={styles.reasonList}>
                {REASONS.map((r) => (
                  <Pressable key={r} style={styles.reasonRow} onPress={() => setReason(r)}>
                    <View style={[styles.radio, reason === r && styles.radioActive]} />
                    <Text style={styles.reasonText}>{r}</Text>
                  </Pressable>
                ))}
              </View>

              <TextInput
                style={styles.noteInput}
                placeholder="Optional: mehr Details..."
                placeholderTextColor={colors.textSecondary}
                multiline
                value={note}
                onChangeText={setNote}
              />

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Pressable
                style={[styles.submitButton, !reason && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={!reason || submitting || (targetType === "photo" && !photoUrl)}
              >
                {submitting ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.submitButtonText}>Meldung senden</Text>}
              </Pressable>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    overlay: { flex: 1, backgroundColor: "#00000099", justifyContent: "flex-end" },
    sheet: {
      backgroundColor: colors.bgPrimary,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      paddingBottom: 36,
      maxHeight: "85%",
    },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
    title: { color: colors.textPrimary, fontSize: 16, fontWeight: "800" },
    chipRow: { flexDirection: "row", gap: 8 },
    chip: {
      backgroundColor: colors.bgCard,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 9,
    },
    chipActive: { backgroundColor: colors.accentPrimary, borderColor: colors.accentPrimary },
    chipText: { color: colors.textSecondary, fontWeight: "700", fontSize: 12.5 },
    chipTextActive: { color: "#ffffff" },
    photoThumbWrap: { borderRadius: 10, borderWidth: 2, borderColor: "transparent" },
    photoThumbWrapActive: { borderColor: colors.accentPrimary },
    photoThumb: { width: 60, height: 60, borderRadius: 8 },
    reasonList: { gap: 10 },
    reasonRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: colors.border },
    radioActive: { borderColor: colors.accentPrimary, backgroundColor: colors.accentPrimary },
    reasonText: { color: colors.textPrimary, fontSize: 14 },
    noteInput: {
      backgroundColor: colors.bgCard,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 12,
      padding: 12,
      color: colors.textPrimary,
      minHeight: 70,
      textAlignVertical: "top",
    },
    error: { color: colors.scoreLow },
    submitButton: { backgroundColor: colors.accentPrimary, borderRadius: 14, padding: 15, alignItems: "center" },
    submitButtonDisabled: { opacity: 0.5 },
    submitButtonText: { color: "#ffffff", fontWeight: "700", fontSize: 14.5 },
    doneBox: { alignItems: "center", gap: 18, paddingVertical: 20 },
    doneText: { color: colors.textPrimary, fontSize: 14.5, textAlign: "center" },
  });
}
