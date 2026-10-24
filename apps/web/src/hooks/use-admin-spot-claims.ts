import { useCallback, useEffect, useState } from "react";
import type { SpotClaimWithDetails } from "@spot/shared";
import { supabase } from "@/lib/supabase";

export function useAdminSpotClaims() {
  const [claims, setClaims] = useState<SpotClaimWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("spot_claims")
      .select("*, spots(name), users(username)")
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    setClaims(
      (
        (data ?? []) as Array<
          Record<string, unknown> & { spots: { name: string } | null; users: { username: string } | null }
        >
      ).map((row) => ({
        ...(row as unknown as SpotClaimWithDetails),
        spot_name: row.spots?.name ?? "Unbekannter Spot",
        username: row.users?.username ?? "Unbekannt",
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function reviewClaim(claimId: string, approve: boolean) {
    await supabase.rpc("admin_review_spot_claim", { p_claim_id: claimId, p_approve: approve });
    load();
  }

  return { claims, loading, reviewClaim, refresh: load };
}
