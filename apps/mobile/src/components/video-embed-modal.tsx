import { Linking, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import type { ColorPalette, VideoPlatform } from "@spot/shared";
import { BackIcon } from "@/components/icons";

function extractYoutubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  return match ? match[1] : null;
}

function buildEmbedHtml(platform: VideoPlatform, url: string): string {
  const body =
    platform === "tiktok"
      ? `<blockquote class="tiktok-embed" cite="${url}" style="max-width:605px;min-width:325px;margin:0 auto;"><section></section></blockquote><script async src="https://www.tiktok.com/embed.js"></script>`
      : platform === "instagram"
        ? `<blockquote class="instagram-media" data-instgrm-permalink="${url}" style="margin:0 auto;"></blockquote><script async src="https://www.instagram.com/embed.js"></script>`
        : (() => {
            const videoId = extractYoutubeId(url);
            return videoId
              ? `<iframe width="100%" height="100%" style="position:fixed;top:0;left:0;" src="https://www.youtube.com/embed/${videoId}?autoplay=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`
              : "";
          })();

  return `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{margin:0;background:#000;display:flex;align-items:center;justify-content:center;min-height:100vh;}</style></head><body>${body}</body></html>`;
}

export function VideoEmbedModal({
  visible,
  platform,
  url,
  colors,
  onClose,
}: {
  visible: boolean;
  platform: VideoPlatform;
  url: string;
  colors: ColorPalette;
  onClose: () => void;
}) {
  const styles = createStyles(colors);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <BackIcon size={18} color={colors.textPrimary} />
          </Pressable>
          <Pressable onPress={() => Linking.openURL(url)}>
            <Text style={styles.openExternal}>Extern öffnen</Text>
          </Pressable>
        </View>
        <WebView
          source={{ html: buildEmbedHtml(platform, url) }}
          style={styles.webview}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
        />
      </View>
    </Modal>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: "#000000" },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingTop: 54,
      paddingBottom: 12,
    },
    closeButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.bgPrimary + "99",
      alignItems: "center",
      justifyContent: "center",
    },
    openExternal: { color: colors.accentPrimary, fontWeight: "700", fontSize: 13 },
    webview: { flex: 1, backgroundColor: "#000000" },
  });
}
