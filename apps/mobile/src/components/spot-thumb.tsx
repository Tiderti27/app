import { Image, StyleSheet, View, type ViewStyle } from "react-native";
import type { SpotCategory } from "@spot/shared";
import { CategoryIcon } from "@/components/icons";

export function SpotThumb({
  photoUrl,
  category,
  bgColor,
  iconColor,
  size,
  iconSize,
  style,
}: {
  photoUrl?: string | null;
  category: SpotCategory;
  bgColor: string;
  iconColor: string;
  size: number;
  iconSize: number;
  style?: ViewStyle;
}) {
  const box = { width: size, height: size, borderRadius: size * 0.22 };

  if (photoUrl) {
    return <Image source={{ uri: photoUrl }} style={[styles.image, box, style as object]} resizeMode="cover" />;
  }

  return (
    <View style={[styles.iconBox, box, style, { backgroundColor: bgColor }]}>
      <CategoryIcon category={category} size={iconSize} color={iconColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  image: { flexShrink: 0 },
  iconBox: { alignItems: "center", justifyContent: "center", flexShrink: 0 },
});
