import type { ReactNode } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import type { ColorPalette } from "@spot/shared";
import { ChevronRightIcon } from "@/components/icons";

interface BaseProps {
  colors: ColorPalette;
  icon?: ReactNode;
  label: string;
  sublabel?: string;
}

export function SettingsNavRow({
  colors,
  icon,
  label,
  sublabel,
  value,
  onPress,
  danger,
}: BaseProps & { value?: string; onPress: () => void; danger?: boolean }) {
  const styles = createStyles(colors);
  return (
    <Pressable style={styles.row} onPress={onPress}>
      {icon && <View style={styles.iconBox}>{icon}</View>}
      <View style={styles.textBox}>
        <Text style={[styles.label, danger && { color: colors.scoreLow }]}>{label}</Text>
        {sublabel && <Text style={styles.sublabel}>{sublabel}</Text>}
      </View>
      {value && <Text style={styles.value}>{value}</Text>}
      <ChevronRightIcon size={16} color={colors.textSecondary} />
    </Pressable>
  );
}

export function SettingsToggleRow({
  colors,
  icon,
  label,
  sublabel,
  value,
  onValueChange,
}: BaseProps & { value: boolean; onValueChange: (next: boolean) => void }) {
  const styles = createStyles(colors);
  return (
    <View style={styles.row}>
      {icon && <View style={styles.iconBox}>{icon}</View>}
      <View style={styles.textBox}>
        <Text style={styles.label}>{label}</Text>
        {sublabel && <Text style={styles.sublabel}>{sublabel}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.accentPrimary }}
        thumbColor="#ffffff"
      />
    </View>
  );
}

export function SettingsInfoRow({ colors, icon, label, sublabel, value }: BaseProps & { value?: string }) {
  const styles = createStyles(colors);
  return (
    <View style={styles.row}>
      {icon && <View style={styles.iconBox}>{icon}</View>}
      <View style={styles.textBox}>
        <Text style={styles.label}>{label}</Text>
        {sublabel && <Text style={styles.sublabel}>{sublabel}</Text>}
      </View>
      {value && <Text style={styles.value}>{value}</Text>}
    </View>
  );
}

export function SettingsSection({
  colors,
  title,
  children,
}: {
  colors: ColorPalette;
  title: string;
  children: ReactNode;
}) {
  const styles = createStyles(colors);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    section: { gap: 8 },
    sectionTitle: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 0.4,
      textTransform: "uppercase",
      paddingHorizontal: 4,
    },
    sectionBody: {
      backgroundColor: colors.bgCard,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      overflow: "hidden",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 14,
      paddingVertical: 13,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    iconBox: { width: 22, alignItems: "center" },
    textBox: { flex: 1, gap: 2 },
    label: { color: colors.textPrimary, fontSize: 14.5, fontWeight: "600" },
    sublabel: { color: colors.textSecondary, fontSize: 12 },
    value: { color: colors.textSecondary, fontSize: 13 },
  });
}
