import { useCallback, useEffect, useState } from "react";
import type { Spot } from "@spot/shared";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";

export function useSaves() {
  const { session } = useAuth();
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!session) {
      setSpots([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data: saveRows } = await supabase
      .from("saves")
      .select("spot_id, created_at")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    const orderedIds = (saveRows ?? []).map((row) => row.spot_id as string);

    if (orderedIds.length === 0) {
      setSpots([]);
      setLoading(false);
      return;
    }

    const { data: spotRows } = await supabase.from("spots_view").select("*").in("id", orderedIds);
    const byId = new Map((spotRows ?? []).map((row) => [row.id as string, row as Spot]));
    setSpots(orderedIds.map((id) => byId.get(id)).filter((spot): spot is Spot => Boolean(spot)));

    setLoading(false);
  }, [session]);

  useEffect(() => {
    load();
  }, [load]);

  return { spots, loading, refresh: load };
}
