import { useCallback, useEffect, useState } from "react";
import type { Spot, SpotVideo } from "@spot/shared";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";

interface SpotDetailState {
  spot: Spot | null;
  videos: SpotVideo[];
  myRating: number | null;
  saved: boolean;
  loading: boolean;
  submitRating: (score: number) => Promise<void>;
  toggleSave: () => Promise<void>;
  refresh: () => void;
}

export function useSpotDetail(spotId: string): SpotDetailState {
  const { session } = useAuth();
  const [spot, setSpot] = useState<Spot | null>(null);
  const [videos, setVideos] = useState<SpotVideo[]>([]);
  const [myRating, setMyRating] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);

    const [{ data: spotData }, { data: videoData }] = await Promise.all([
      supabase.from("spots_view").select("*").eq("id", spotId).single(),
      supabase.from("videos").select("*").eq("spot_id", spotId).order("created_at", { ascending: false }),
    ]);

    setSpot((spotData as Spot | null) ?? null);
    setVideos((videoData ?? []) as SpotVideo[]);

    if (session) {
      const [{ data: ratingData }, { data: saveData }] = await Promise.all([
        supabase
          .from("ratings")
          .select("score")
          .eq("spot_id", spotId)
          .eq("user_id", session.user.id)
          .maybeSingle(),
        supabase
          .from("saves")
          .select("spot_id")
          .eq("spot_id", spotId)
          .eq("user_id", session.user.id)
          .maybeSingle(),
      ]);
      setMyRating(ratingData?.score ?? null);
      setSaved(Boolean(saveData));
    }

    setLoading(false);
  }, [spotId, session]);

  useEffect(() => {
    load();
  }, [load]);

  async function submitRating(score: number) {
    if (!session) return;
    await supabase
      .from("ratings")
      .upsert({ spot_id: spotId, user_id: session.user.id, score }, { onConflict: "spot_id,user_id" });
    setMyRating(score);
    load();
  }

  async function toggleSave() {
    if (!session) return;
    if (saved) {
      await supabase.from("saves").delete().eq("spot_id", spotId).eq("user_id", session.user.id);
      setSaved(false);
    } else {
      await supabase.from("saves").insert({ spot_id: spotId, user_id: session.user.id });
      setSaved(true);
    }
    load();
  }

  return { spot, videos, myRating, saved, loading, submitRating, toggleSave, refresh: load };
}
