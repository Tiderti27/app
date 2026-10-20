import { useState } from "react";
import { supabase } from "@/lib/supabase";

export interface SpotSearchResult {
  id: string;
  name: string;
  city: string;
}

function looksLikeLink(input: string): boolean {
  return /^https?:\/\//i.test(input.trim()) || /(tiktok\.com|instagram\.com|youtu\.be)/i.test(input);
}

function extractVideoId(url: string): string | null {
  const tiktok = url.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/);
  if (tiktok) return tiktok[1];

  const instagram = url.match(/instagram\.com\/(?:reel|p|tv)\/([A-Za-z0-9_-]+)/);
  if (instagram) return instagram[1];

  const youtube = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (youtube) return youtube[1];

  return null;
}

interface SpotSearchState {
  results: SpotSearchResult[];
  loading: boolean;
  linkNotFound: boolean;
  search: (query: string) => Promise<{ matchedSpotId: string | null }>;
  clear: () => void;
}

export function useSpotSearch(): SpotSearchState {
  const [results, setResults] = useState<SpotSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [linkNotFound, setLinkNotFound] = useState(false);

  async function search(query: string): Promise<{ matchedSpotId: string | null }> {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setLinkNotFound(false);
      return { matchedSpotId: null };
    }

    setLoading(true);
    setLinkNotFound(false);

    if (looksLikeLink(trimmed)) {
      let resolvedUrl = trimmed;
      let videoId = extractVideoId(trimmed);

      if (!videoId) {
        try {
          const response = await fetch(trimmed, { redirect: "follow" });
          resolvedUrl = response.url || trimmed;
          videoId = extractVideoId(resolvedUrl);
        } catch {
          // Kurzlink konnte nicht aufgeloest werden -- unten mit der
          // Original-URL weitersuchen.
        }
      }

      const searchTerm = videoId ?? resolvedUrl;
      const { data } = await supabase
        .from("videos")
        .select("spot_id")
        .ilike("video_url", `%${searchTerm}%`)
        .limit(1)
        .maybeSingle();

      setLoading(false);
      setResults([]);

      if (data?.spot_id) return { matchedSpotId: data.spot_id as string };
      setLinkNotFound(true);
      return { matchedSpotId: null };
    }

    const { data } = await supabase
      .from("spots_view")
      .select("id, name, city")
      .ilike("name", `%${trimmed}%`)
      .limit(20);

    setResults((data ?? []) as SpotSearchResult[]);
    setLoading(false);
    return { matchedSpotId: null };
  }

  function clear() {
    setResults([]);
    setLinkNotFound(false);
  }

  return { results, loading, linkNotFound, search, clear };
}
