import { useCallback, useEffect, useState } from "react";
import type { CreatorStats, SpotVideo, VideoPlatform } from "@spot/shared";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";

export interface CreatorVideo extends SpotVideo {
  spot_name: string;
}

export interface SpotOption {
  id: string;
  name: string;
  city: string;
}

interface CreatorState {
  videos: CreatorVideo[];
  stats: CreatorStats | null;
  loading: boolean;
  addVideo: (input: {
    spotId: string;
    platform: VideoPlatform;
    url: string;
    title: string;
    isCooperation: boolean;
  }) => Promise<string | null>;
  removeVideo: (id: string) => Promise<void>;
  searchSpots: (query: string) => Promise<SpotOption[]>;
  refresh: () => void;
}

export function useCreator(enabled: boolean): CreatorState {
  const { session } = useAuth();
  const [videos, setVideos] = useState<CreatorVideo[]>([]);
  const [stats, setStats] = useState<CreatorStats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!enabled || !session) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const [{ data: videoData }, { data: statsData }] = await Promise.all([
      supabase
        .from("videos")
        .select("*, spots(name)")
        .eq("creator_id", session.user.id)
        .order("created_at", { ascending: false }),
      supabase.rpc("creator_stats"),
    ]);

    setVideos(
      (videoData ?? []).map((row: any) => ({
        ...row,
        spot_name: row.spots?.name ?? "Unbekannter Spot",
      }))
    );

    const statsRow = Array.isArray(statsData) ? statsData[0] : statsData;
    setStats((statsRow ?? null) as CreatorStats | null);
    setLoading(false);
  }, [enabled, session]);

  useEffect(() => {
    load();
  }, [load]);

  async function addVideo(input: {
    spotId: string;
    platform: VideoPlatform;
    url: string;
    title: string;
    isCooperation: boolean;
  }): Promise<string | null> {
    if (!session) return "Nicht angemeldet";
    const { error } = await supabase.from("videos").insert({
      spot_id: input.spotId,
      creator_id: session.user.id,
      platform: input.platform,
      video_url: input.url,
      title: input.title || null,
      is_cooperation: input.isCooperation,
    });
    if (error) return error.message;
    load();
    return null;
  }

  async function removeVideo(id: string) {
    await supabase.from("videos").delete().eq("id", id);
    load();
  }

  async function searchSpots(query: string): Promise<SpotOption[]> {
    if (!query.trim()) return [];
    const { data } = await supabase
      .from("spots_view")
      .select("id, name, city")
      .ilike("name", `%${query.trim()}%`)
      .limit(5);
    return (data ?? []) as SpotOption[];
  }

  return { videos, stats, loading, addVideo, removeVideo, searchSpots, refresh: load };
}
