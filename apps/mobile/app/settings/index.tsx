import { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import * as Location from "expo-location";
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import type { ColorPalette, ThemePreference } from "@spot/shared";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { useSettings } from "@/hooks/use-settings";
import { BackIcon, BellIcon, GearIcon, InfoIcon, LocationIcon, LockIcon, ShieldIcon, UserIcon } from "@/components/icons";
import { SettingsInfoRow, SettingsNavRow, SettingsSection, SettingsToggleRow } from "@/components/settings-row";

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "light", label: "Hell" },
  { value: "dark", label: "Dunkel" },
  { value: "system", label: "System" },
];

const SUPPORT_EMAIL = "support@spot-app.de";

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, mode, preference, setMode } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { session, signOut } = useAuth();
  const { user, setNotificationPref, updateUsername } = useSettings();
  const [editingUsername, setEditingUsername] = useState(false);
  const [usernameDraft, setUsernameDraft] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>("Wird geprüft...");

  useEffect(() => {
    Location.getForegroundPermissionsAsync().then(({ status }) => {
      setLocationStatus(status === "granted" ? "Erlaubt" : status === "denied" ? "Nicht erlaubt" : "Noch nicht entschieden");
    });
  }, []);

  function startEditUsername() {
    setUsernameDraft(user?.username ?? "");
    setUsernameError(null);
    setEditingUsername(true);
  }

  async function confirmUsername() {
    const trimmed = usernameDraft.trim();
    if (!trimmed) {
      setUsernameError("Darf nicht leer sein.");
      return;
    }
    const { error } = await updateUsername(trimmed);
    if (error) setUsernameError(error);
    else setEditingUsername(false);
  }

  function handleSupportEmail() {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Spot-App%20Support`);
  }

  function handleSignOut() {
    Alert.alert("Abmelden", "Möchtest du dich wirklich abmelden?", [
      { text: "Abbrechen", style: "cancel" },
      { text: "Abmelden", style: "destructive", onPress: signOut },
    ]);
  }

  const appVersion = Constants.expoConfig?.version ?? "0.0.0";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <BackIcon size={18} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Einstellungen</Text>
        <View style={{ width: 38 }} />
      </View>

      <SettingsSection colors={colors} title="Konto">
        <SettingsInfoRow colors={colors} icon={<UserIcon size={18} color={colors.textSecondary} />} label="E-Mail" value={session?.user.email ?? "-"} />

        {editingUsername ? (
          <View style={styles.editRow}>
            <TextInput
              style={styles.editInput}
              value={usernameDraft}
              onChangeText={setUsernameDraft}
              autoCapitalize="none"
              placeholder="Benutzername"
              placeholderTextColor={colors.textSecondary}
            />
            {usernameError && <Text style={styles.editError}>{usernameError}</Text>}
            <View style={styles.editActions}>
              <Pressable style={styles.editCancel} onPress={() => setEditingUsername(false)}>
                <Text style={styles.editCancelText}>Abbrechen</Text>
              </Pressable>
              <Pressable style={styles.editConfirm} onPress={confirmUsername}>
                <Text style={styles.editConfirmText}>Speichern</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <SettingsNavRow
            colors={colors}
            icon={<UserIcon size={18} color={colors.textSecondary} />}
            label="Benutzername"
            value={user?.username ?? "-"}
            onPress={startEditUsername}
          />
        )}

        <SettingsNavRow
          colors={colors}
          icon={<LockIcon size={18} color={colors.textSecondary} />}
          label="Passwort ändern"
          onPress={() => router.push("/settings/change-password")}
        />
      </SettingsSection>

      <SettingsSection colors={colors} title="Darstellung">
        <View style={styles.themeRow}>
          <View style={styles.themeIconLabel}>
            <GearIcon size={18} color={colors.textSecondary} />
            <Text style={styles.label}>Design</Text>
          </View>
          <View style={styles.themeChips}>
            {THEME_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                style={[styles.themeChip, preference === option.value && styles.themeChipActive]}
                onPress={() => setMode(option.value)}
              >
                <Text style={[styles.themeChipText, preference === option.value && styles.themeChipTextActive]}>
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        {preference === "system" && (
          <Text style={styles.themeHint}>Folgt der Systemeinstellung deines Geräts (aktuell: {mode === "light" ? "Hell" : "Dunkel"}).</Text>
        )}
      </SettingsSection>

      <SettingsSection colors={colors} title="Benachrichtigungen">
        <SettingsToggleRow
          colors={colors}
          icon={<BellIcon size={18} color={colors.textSecondary} />}
          label="Neue Aktionen in der Nähe"
          sublabel="Benachrichtigung bei neuen Rabattaktionen"
          value={user?.notify_promotions ?? true}
          onValueChange={(next) => setNotificationPref("notify_promotions", next)}
        />
        <SettingsToggleRow
          colors={colors}
          icon={<BellIcon size={18} color={colors.textSecondary} />}
          label="Updates zu gespeicherten Spots"
          sublabel="z.B. neue Fotos oder Rabattcodes"
          value={user?.notify_saved_updates ?? true}
          onValueChange={(next) => setNotificationPref("notify_saved_updates", next)}
        />
      </SettingsSection>

      <SettingsSection colors={colors} title="Datenschutz">
        <SettingsInfoRow
          colors={colors}
          icon={<LocationIcon size={18} color={colors.textSecondary} />}
          label="Standortzugriff"
          value={locationStatus}
        />
        <SettingsNavRow
          colors={colors}
          icon={<ShieldIcon size={18} color={colors.textSecondary} />}
          label="Berechtigungen verwalten"
          sublabel="Öffnet die Systemeinstellungen"
          onPress={() => Linking.openSettings()}
        />
      </SettingsSection>

      <SettingsSection colors={colors} title="Support & Info">
        <SettingsInfoRow colors={colors} icon={<InfoIcon size={18} color={colors.textSecondary} />} label="App-Version" value={appVersion} />
        <SettingsNavRow
          colors={colors}
          icon={<InfoIcon size={18} color={colors.textSecondary} />}
          label="Support kontaktieren"
          onPress={handleSupportEmail}
        />
        <SettingsNavRow
          colors={colors}
          icon={<InfoIcon size={18} color={colors.textSecondary} />}
          label="Einführung erneut ansehen"
          onPress={() => router.push("/onboarding")}
        />
      </SettingsSection>

      <SettingsSection colors={colors} title="Konto-Aktionen">
        <SettingsNavRow colors={colors} label="Abmelden" onPress={handleSignOut} />
        <SettingsNavRow
          colors={colors}
          label="Konto löschen"
          danger
          onPress={() => router.push("/settings/delete-account")}
        />
      </SettingsSection>
    </ScrollView>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bgPrimary },
    content: { padding: 20, paddingBottom: 48, gap: 20 },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 48, marginBottom: 4 },
    backButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.bgCard,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: { color: colors.textPrimary, fontSize: 17, fontWeight: "800" },
    label: { color: colors.textPrimary, fontSize: 14.5, fontWeight: "600" },
    editRow: { padding: 14, gap: 10 },
    editInput: {
      backgroundColor: colors.bgElevated,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: colors.textPrimary,
    },
    editError: { color: colors.scoreLow, fontSize: 12 },
    editActions: { flexDirection: "row", gap: 8, justifyContent: "flex-end" },
    editCancel: { paddingHorizontal: 14, paddingVertical: 9 },
    editCancelText: { color: colors.textSecondary, fontWeight: "600", fontSize: 13 },
    editConfirm: { backgroundColor: colors.accentPrimary, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 9 },
    editConfirmText: { color: "#ffffff", fontWeight: "700", fontSize: 13 },
    themeRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14 },
    themeIconLabel: { flexDirection: "row", alignItems: "center", gap: 10 },
    themeChips: { flexDirection: "row", gap: 6 },
    themeChip: {
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 8,
      backgroundColor: colors.bgElevated,
      borderWidth: 1,
      borderColor: colors.border,
    },
    themeChipActive: { backgroundColor: colors.accentPrimary, borderColor: colors.accentPrimary },
    themeChipText: { color: colors.textSecondary, fontSize: 12, fontWeight: "600" },
    themeChipTextActive: { color: "#ffffff" },
    themeHint: { color: colors.textSecondary, fontSize: 11.5, paddingHorizontal: 4 },
  });
}
