import { Linking, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import type { ColorPalette, VideoPlatform } from "@spot/shared";
import { BackIcon } from "@/components/icons";

function extractTiktokId(url: string): string | null {
  const withUser = url.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/);
  if (withUser) return withUser[1];
  const idOnly = url.match(/tiktok\.com\/(?:embed\/v2\/|[^"'\s]*\/video\/)(\d+)/);
  return idOnly ? idOnly[1] : null;
}

function extractYoutubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  return match ? match[1] : null;
}

// TikTok und YouTube bieten beide eine direkte, unauthentifizierte Embed-Seite
// an (kein oEmbed-Aufruf noetig, der zuletzt ans Ratelimit lief) -- die laedt
// die WebView direkt als eigene Seite statt als selbstgebautes HTML-Dokument.
function directEmbedUri(platform: VideoPlatform, url: string): string | null {
  if (platform === "tiktok") {
    const id = extractTiktokId(url);
    return id ? `https://www.tiktok.com/embed/v2/${id}` : null;
  }
  if (platform === "youtube") {
    const id = extractYoutubeId(url);
    return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : null;
  }
  return null;
}

function instagramEmbedHtml(url: string): string {
  const body = `<blockquote class="instagram-media" data-instgrm-permalink="${url}" style="margin:0 auto;"></blockquote><script async src="https://www.instagram.com/embed.js"></script>`;
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
  const directUri = directEmbedUri(platform, url);

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
          source={directUri ? { uri: directUri } : { html: instagramEmbedHtml(url) }}
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
