import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { looksLikeVideoLink, resolveVideoLink } from "@/lib/video-link";

export interface SpotSearchResult {
  id: string;
  name: string;
  city: string;
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

    if (looksLikeVideoLink(trimmed)) {
      const resolved = await resolveVideoLink(trimmed);

      if (!resolved) {
        setLoading(false);
        setResults([]);
        setLinkNotFound(true);
        return { matchedSpotId: null };
      }

      const { data } = await supabase
        .from("videos")
        .select("spot_id")
        .ilike("video_url", `%${resolved.id}%`)
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
