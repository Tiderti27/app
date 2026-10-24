import { useMemo, useRef, useState, type ElementRef } from "react";
import { useRouter } from "expo-router";
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { ColorPalette } from "@spot/shared";
import { useTheme } from "@/context/theme-context";
import { useOnboarding } from "@/hooks/use-onboarding";
import { MapIcon, GiftIcon, PlayIcon, PinIcon } from "@/components/icons";

const WIDTH = Dimensions.get("window").width;

const SLIDES = [
  {
    Icon: MapIcon,
    title: "Entdecke virale Orte",
    text: "Finde Cafés, Läden und Spots in deiner Nähe, die gerade auf TikTok & Instagram angesagt sind.",
  },
  {
    Icon: PlayIcon,
    title: "Bewerten & teilen",
    text: "Bewerte Orte, die du besucht hast, und sieh dir Videos direkt in der App an.",
  },
  {
    Icon: GiftIcon,
    title: "Rabatte sichern",
    text: "Viele Spots bieten exklusive Rabattcodes über Creator — direkt in der App einlösen.",
  },
];

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { markSeen } = useOnboarding();
  const router = useRouter();
  const scrollRef = useRef<ElementRef<typeof ScrollView>>(null);
  const [index, setIndex] = useState(0);

  async function handleDone() {
    await markSeen();
    router.replace("/(auth)/login");
  }

  function handleNext() {
    if (index < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({ x: (index + 1) * WIDTH, animated: true });
      setIndex(index + 1);
    } else {
      handleDone();
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.brandRow}>
        <PinIcon size={20} color={colors.accentPrimary} />
        <Text style={styles.brand}>Spot</Text>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / WIDTH))}
      >
        {SLIDES.map((slide, i) => (
          <View key={i} style={[styles.slide, { width: WIDTH }]}>
            <View style={styles.iconCircle}>
              <slide.Icon size={48} color={colors.accentPrimary} />
            </View>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.text}>{slide.text}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>

        <Pressable style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>{index === SLIDES.length - 1 ? "Los geht's" : "Weiter"}</Text>
        </Pressable>

        {index < SLIDES.length - 1 && (
          <Pressable onPress={handleDone}>
            <Text style={styles.skip}>Überspringen</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bgPrimary },
    brandRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingTop: 60, paddingLeft: 24 },
    brand: { fontSize: 18, fontWeight: "800", color: colors.textPrimary },
    slide: { flex: 1, alignItems: "center", justifyContent: "center", padding: 36, gap: 20 },
    iconCircle: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.bgCard,
      alignItems: "center",
      justifyContent: "center",
    },
    title: { color: colors.textPrimary, fontSize: 22, fontWeight: "800", textAlign: "center" },
    text: { color: colors.textSecondary, fontSize: 14.5, lineHeight: 21, textAlign: "center" },
    footer: { padding: 28, paddingBottom: 44, gap: 16, alignItems: "center" },
    dots: { flexDirection: "row", gap: 6 },
    dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.border },
    dotActive: { backgroundColor: colors.accentPrimary, width: 20 },
    button: {
      backgroundColor: colors.accentPrimary,
      borderRadius: 14,
      paddingVertical: 15,
      alignItems: "center",
      width: "100%",
    },
    buttonText: { color: "#ffffff", fontWeight: "700", fontSize: 15 },
    skip: { color: colors.textSecondary, fontSize: 13, fontWeight: "600" },
  });
}
