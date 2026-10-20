import type { VideoPlatform } from "@spot/shared";

export interface ResolvedVideoLink {
  platform: VideoPlatform;
  id: string;
  canonicalUrl: string;
}

function extractFromText(text: string): ResolvedVideoLink | null {
  const tiktokWithUser = text.match(/tiktok\.com\/@([\w.-]+)\/video\/(\d+)/);
  if (tiktokWithUser) {
    return {
      platform: "tiktok",
      id: tiktokWithUser[2],
      canonicalUrl: `https://www.tiktok.com/@${tiktokWithUser[1]}/video/${tiktokWithUser[2]}`,
    };
  }

  // Kein Username im Text (z.B. og:url-Meta-Tag einer aufgeloesten Kurzlink-
  // Seite) -- die ID allein reicht, Embed-Link bleibt trotzdem funktionsfaehig.
  const tiktokIdOnly = text.match(/tiktok\.com\/(?:[^"'\s]*\/)?video\/(\d+)/);
  if (tiktokIdOnly) {
    return {
      platform: "tiktok",
      id: tiktokIdOnly[1],
      canonicalUrl: `https://www.tiktok.com/embed/v2/${tiktokIdOnly[1]}`,
    };
  }

  const instagram = text.match(/instagram\.com\/(?:reel|p|tv)\/([A-Za-z0-9_-]+)/);
  if (instagram) {
    return {
      platform: "instagram",
      id: instagram[1],
      canonicalUrl: `https://www.instagram.com/reel/${instagram[1]}/`,
    };
  }

  const youtube = text.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (youtube) {
    return {
      platform: "youtube",
      id: youtube[1],
      canonicalUrl: `https://www.youtube.com/watch?v=${youtube[1]}`,
    };
  }

  return null;
}

export function looksLikeVideoLink(input: string): boolean {
  return /^https?:\/\//i.test(input.trim()) || /(tiktok\.com|instagram\.com|youtu\.be)/i.test(input);
}

/**
 * Loest einen Video-Link in Plattform + stabile ID + kanonische URL auf.
 * TikTok-Kurzlinks (vm.tiktok.com/..., tiktok.com/t/...) aendern sich bei
 * jedem neuen Teilen -- ein simples HTTP-Redirect-Follow reicht nicht, da
 * TikTok dafuer oft eine Zwischenseite statt eines 301/302 ausliefert.
 * Deshalb wird noetigenfalls der HTML-Body geladen und darin nach der
 * kanonischen URL/ID gesucht (steht dort z.B. in og:url-Meta-Tags).
 */
export async function resolveVideoLink(input: string): Promise<ResolvedVideoLink | null> {
  const trimmed = input.trim();
  const direct = extractFromText(trimmed);
  if (direct) return direct;

  if (!looksLikeVideoLink(trimmed)) return null;

  try {
    const response = await fetch(trimmed);
    const html = await response.text();
    return extractFromText(html) ?? extractFromText(response.url);
  } catch {
    return null;
  }
}
