import { useState } from "react";
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

function fallbackEmbedHtml(platform: VideoPlatform, url: string): string {
  const body =
    platform === "tiktok"
      ? `<blockquote class="tiktok-embed" cite="${url}" style="max-width:605px;min-width:325px;margin:0 auto;"><section></section></blockquote><script async src="https://www.tiktok.com/embed.js"></script>`
      : `<blockquote class="instagram-media" data-instgrm-permalink="${url}" style="margin:0 auto;"></blockquote><script async src="https://www.instagram.com/embed.js"></script>`;

  return `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{margin:0;background:#000;display:flex;align-items:center;justify-content:center;min-height:100vh;}</style></head><body>${body}</body></html>`;
}

// TikToks eigene Embed-Seite liefert bei zu vielen Aufrufen vom selben
// Netzwerk/Geraet ein HTTP 200 mit Fehlertext im Body ("Rate limit
// exceeded") statt eines HTTP-Fehlers -- onError/onHttpError feuern dann
// nicht. Deshalb den sichtbaren Text pruefen und per postMessage melden.
const RATE_LIMIT_CHECK_SCRIPT = `
  setTimeout(function () {
    var text = (document.body && document.body.innerText || "").toLowerCase();
    if (text.indexOf("rate limit") !== -1 || text.indexOf("ratelimit") !== -1) {
      window.ReactNativeWebView.postMessage("rate-limited:" + text.slice(0, 120));
    } else {
      window.ReactNativeWebView.postMessage("page-text:" + text.slice(0, 120));
    }
  }, 1500);
  true;
`;

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
  const [loadFailed, setLoadFailed] = useState(false);
  const loadedUriInfo = `uri: ${directUri ?? "(kein direct embed, fallback-html)"}`;
  const [debugInfo, setDebugInfo] = useState("noch kein Event");

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <BackIcon size={18} color={colors.textPrimary} />
          </Pressable>
          <Pressable style={styles.externalButton} onPress={() => Linking.openURL(url)}>
            <Text style={styles.openExternal}>Extern öffnen</Text>
          </Pressable>
        </View>

        {loadFailed ? (
          <View style={styles.failedBox}>
            <Text style={styles.failedTitle}>Video konnte nicht geladen werden</Text>
            <Text style={styles.failedText}>
              Das kann an einem vorübergehenden Limit von {platform === "tiktok" ? "TikTok" : "Instagram"} liegen.
              Versuch es gleich nochmal oder öffne das Video extern.
            </Text>
            <Pressable style={styles.retryButton} onPress={() => Linking.openURL(url)}>
              <Text style={styles.retryButtonText}>Extern öffnen</Text>
            </Pressable>
          </View>
        ) : (
          <WebView
            source={directUri ? { uri: directUri } : { html: fallbackEmbedHtml(platform, url) }}
            style={styles.webview}
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            onError={(event) => {
              setDebugInfo(`onError: ${JSON.stringify(event.nativeEvent.description ?? event.nativeEvent)}`);
              setLoadFailed(true);
            }}
            onHttpError={(event) => {
              setDebugInfo(`onHttpError: status ${event.nativeEvent.statusCode}`);
              setLoadFailed(true);
            }}
            onMessage={(event) => {
              const data = event.nativeEvent.data;
              setDebugInfo(data);
              if (data.startsWith("rate-limited")) setLoadFailed(true);
            }}
            injectedJavaScript={RATE_LIMIT_CHECK_SCRIPT}
          />
        )}

        <Text style={styles.hint}>Lädt nicht? Oben rechts "Extern öffnen" nutzen.</Text>
        <Text style={styles.debug}>{loadedUriInfo}</Text>
        <Text style={styles.debug}>{debugInfo}</Text>
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
    externalButton: {
      backgroundColor: colors.accentPrimary,
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    openExternal: { color: "#ffffff", fontWeight: "700", fontSize: 13 },
    webview: { flex: 1, backgroundColor: "#000000" },
    hint: { color: "#8a8a8a", fontSize: 11, textAlign: "center", paddingVertical: 10 },
    debug: {
      color: "#5a5a5a",
      fontSize: 9,
      textAlign: "center",
      paddingHorizontal: 12,
      paddingBottom: 10,
      fontFamily: "monospace",
    },
    failedBox: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, padding: 32 },
    failedTitle: { color: "#ffffff", fontSize: 16, fontWeight: "700", textAlign: "center" },
    failedText: { color: "#b5b5b5", fontSize: 13, textAlign: "center", lineHeight: 19 },
    retryButton: {
      backgroundColor: colors.accentPrimary,
      borderRadius: 12,
      paddingHorizontal: 20,
      paddingVertical: 12,
      marginTop: 6,
    },
    retryButtonText: { color: "#ffffff", fontWeight: "700", fontSize: 14 },
  });
}
