import { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Dimensions, Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { formatOpeningHours, type ColorPalette, type SpotVideo, type VideoPlatform } from "@spot/shared";
import { useSpotDetail } from "@/hooks/use-spot-detail";
import { useTheme } from "@/context/theme-context";
import { supabase } from "@/lib/supabase";
import { BackIcon, CategoryIcon, ClockIcon, FlagIcon, HeartIcon, PlayIcon } from "@/components/icons";
import { ScoreBadge } from "@/components/score-badge";
import { PromotionSection } from "@/components/promotion-section";
import { VideoEmbedModal } from "@/components/video-embed-modal";
import { ReportModal } from "@/components/report-modal";

const RATING_PRESETS = [60, 75, 85, 95, 100];
const HERO_WIDTH = Dimensions.get("window").width;

const PLATFORM_LABEL: Record<VideoPlatform, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  youtube: "YouTube",
};

export default function SpotDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, mode } = useTheme();
  const heroBg = mode === "light" ? "#ece7f5" : "#161320";
  const styles = useMemo(() => createStyles(colors, heroBg), [colors, heroBg]);
  const { spot, videos, myRating, saved, loading, submitRating, toggleSave } = useSpotDetail(id);
  const [activeVideo, setActiveVideo] = useState<SpotVideo | null>(null);
  const [reportVisible, setReportVisible] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase.rpc("log_spot_view", { p_spot_id: id }).then(() => {});
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accentPrimary} />
      </View>
    );
  }

  if (!spot) {
    return (
      <View style={styles.centered}>
        <Text style={styles.text}>Spot nicht gefunden.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} stickyHeaderIndices={[]}>
      <View style={styles.hero}>
        {spot.photos.length > 0 ? (
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.heroGallery}>
            {spot.photos.map((url) => (
              <Image key={url} source={{ uri: url }} style={styles.heroImage} resizeMode="cover" />
            ))}
          </ScrollView>
        ) : (
          <CategoryIcon category={spot.category} size={44} color={colors.border} />
        )}
        <Pressable style={[styles.heroButton, styles.heroButtonLeft]} onPress={() => {}}>
          <BackIcon size={18} color={colors.textPrimary} />
        </Pressable>
        <Pressable style={[styles.heroButton, styles.heroButtonRight]} onPress={toggleSave}>
          <HeartIcon size={18} color={colors.accentPrimary} filled={saved} />
        </Pressable>
        <Pressable style={[styles.heroButton, styles.heroButtonFlag]} onPress={() => setReportVisible(true)}>
          <FlagIcon size={16} color={colors.textSecondary} />
        </Pressable>
        <View style={styles.heroScore}>
          <ScoreBadge score={spot.score} colors={colors} size="large" />
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.infoSection}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{spot.name}</Text>
            <View style={styles.categoryChip}>
              <CategoryIcon category={spot.category} size={12} color={colors.textSecondary} />
              <Text style={styles.categoryChipText}>{spot.category}</Text>
            </View>
          </View>

          <Text style={styles.text}>
            {spot.address}, {spot.city} · {spot.score_count} Bewertungen
          </Text>
          {(spot.phone || spot.website) && (
            <Text style={styles.text}>{[spot.phone, spot.website].filter(Boolean).join(" · ")}</Text>
          )}
          {spot.description ? <Text style={styles.description}>{spot.description}</Text> : null}
        </View>

        <View style={styles.ratingSection}>
          {myRating === null ? (
            <Pressable style={styles.primaryButton} onPress={() => submitRating(90)}>
              <Text style={styles.primaryButtonText}>War gut hier</Text>
            </Pressable>
          ) : (
            <>
              <View style={styles.ratingHeader}>
                <Text style={styles.ratingHeaderLabel}>Deine Bewertung</Text>
                <Text style={styles.myRating}>{myRating} gespeichert</Text>
              </View>
              <View style={styles.presetRow}>
                {RATING_PRESETS.map((preset) => (
                  <Pressable
                    key={preset}
                    style={[styles.presetButton, myRating === preset && styles.presetButtonActive]}
                    onPress={() => submitRating(preset)}
                  >
                    <Text style={[styles.presetText, myRating === preset && styles.presetTextActive]}>{preset}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}
        </View>

        {videos.length > 0 && (
          <View style={styles.videoSection}>
            <Text style={styles.sectionTitle}>Videos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
              {videos.map((video) => (
                <Pressable
                  key={video.id}
                  style={styles.videoCard}
                  onPress={() => {
                    // TikToks Embed-Endpunkt ist auf unserem Testnetz dauerhaft
                    // ratelimitiert (HTTP 429) -- statt erst einen In-App-Embed
                    // zu versuchen, der zuverlaessig fehlschlaegt, oeffnen wir
                    // TikTok-Videos direkt extern. Instagram/YouTube laufen
                    // weiterhin ueber den In-App-Embed.
                    if (video.platform === "tiktok") {
                      Linking.openURL(video.video_url);
                    } else {
                      setActiveVideo(video);
                    }
                  }}
                >
                  <View style={styles.videoThumb}>
                    <PlayIcon size={20} color={colors.textPrimary} />
                  </View>
                  <Text style={styles.videoPlatform}>{PLATFORM_LABEL[video.platform]}</Text>
                  <Text style={styles.videoTitle} numberOfLines={1}>
                    {video.title ?? video.video_url}
                  </Text>
                  {video.is_cooperation && <Text style={styles.cooperationBadge}>Kooperation</Text>}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        <PromotionSection spotId={spot.id} colors={colors} />

        {spot.opening_hours && (
          <View style={styles.hoursRow}>
            <ClockIcon size={15} color={colors.accentPrimary} />
            <View style={styles.hoursLines}>
              {formatOpeningHours(spot.opening_hours).length > 0 ? (
                formatOpeningHours(spot.opening_hours).map((line) => (
                  <Text key={line} style={styles.hoursText}>
                    {line}
                  </Text>
                ))
              ) : (
                <Text style={styles.hoursText}>Keine Öffnungszeiten hinterlegt</Text>
              )}
            </View>
          </View>
        )}
      </View>

      {activeVideo && (
        <VideoEmbedModal
          visible={Boolean(activeVideo)}
          platform={activeVideo.platform}
          url={activeVideo.video_url}
          colors={colors}
          onClose={() => setActiveVideo(null)}
        />
      )}

      <ReportModal
        visible={reportVisible}
        spotId={spot.id}
        photos={spot.photos}
        colors={colors}
        onClose={() => setReportVisible(false)}
      />
    </ScrollView>
  );
}

function createStyles(colors: ColorPalette, heroBg: string) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bgPrimary },
    content: { paddingBottom: 24 },
    centered: { flex: 1, backgroundColor: colors.bgPrimary, alignItems: "center", justifyContent: "center" },
    hero: {
      height: 190,
      backgroundColor: heroBg,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    heroGallery: { width: "100%", height: "100%" },
    heroImage: { width: HERO_WIDTH, height: 190 },
    heroButton: {
      position: "absolute",
      top: 18,
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.bgPrimary + "99",
      alignItems: "center",
      justifyContent: "center",
    },
    heroButtonLeft: { left: 18 },
    heroButtonRight: { right: 18 },
    heroButtonFlag: { right: 18, top: 64 },
    heroScore: { position: "absolute", left: 20, bottom: -26 },
    body: { padding: 20, paddingTop: 38, gap: 22 },
    infoSection: { gap: 8 },
    titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
    title: { color: colors.textPrimary, fontSize: 22, fontWeight: "800", flexShrink: 1 },
    categoryChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: colors.bgCard,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    categoryChipText: { color: colors.textSecondary, fontSize: 11.5, fontWeight: "700", textTransform: "capitalize" },
    text: { color: colors.textSecondary, fontSize: 13 },
    description: { color: colors.textPrimary, marginTop: 4, lineHeight: 20, fontSize: 13.5 },
    ratingSection: {
      gap: 12,
      backgroundColor: colors.bgCard,
      borderColor: colors.border,
      borderWidth: 1.5,
      borderRadius: 16,
      padding: 16,
    },
    ratingHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    ratingHeaderLabel: { color: colors.textPrimary, fontSize: 14, fontWeight: "700" },
    myRating: { color: colors.scoreHigh, fontWeight: "700", fontSize: 12 },
    primaryButton: {
      backgroundColor: colors.accentPrimary,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: "center",
    },
    primaryButtonText: { color: "#ffffff", fontWeight: "700" },
    presetRow: { flexDirection: "row", gap: 8 },
    presetButton: {
      flex: 1,
      backgroundColor: colors.bgElevated,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 11,
      paddingVertical: 12,
      alignItems: "center",
    },
    presetButtonActive: { backgroundColor: colors.accentPrimary, borderColor: colors.accentPrimary },
    presetText: { color: colors.textPrimary, fontWeight: "700" },
    presetTextActive: { color: "#ffffff" },
    videoSection: { gap: 10 },
    sectionTitle: { color: colors.textPrimary, fontSize: 15, fontWeight: "700" },
    videoCard: { width: 120, gap: 6 },
    videoThumb: {
      width: 120,
      height: 150,
      borderRadius: 14,
      backgroundColor: colors.bgCard,
      borderColor: colors.border,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    videoPlatform: { color: colors.accentSecondary, fontSize: 11, fontWeight: "700" },
    videoTitle: { color: colors.textPrimary, fontSize: 12 },
    cooperationBadge: { color: colors.scoreMid, fontSize: 11, fontWeight: "600" },
    hoursRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
      backgroundColor: colors.bgCard,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 14,
      padding: 14,
    },
    hoursLines: { flex: 1, gap: 4 },
    hoursText: { color: colors.textPrimary, fontSize: 12.5, fontWeight: "600", flexShrink: 1 },
  });
}
