import { useEffect, useState } from "react";
import type { DiscountType, RedemptionStatus } from "@spot/shared";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";

export interface MyRating {
  id: string;
  spot_id: string;
  spot_name: string;
  score: number;
  created_at: string;
}

export interface MyRedemption {
  id: string;
  spot_name: string;
  discount_type: DiscountType;
  discount_value: number;
  status: RedemptionStatus;
  redeemed_at: string | null;
  created_at: string;
}

interface ProfileActivity {
  ratings: MyRating[];
  redemptions: MyRedemption[];
  loading: boolean;
}

export function useProfileActivity(): ProfileActivity {
  const { session } = useAuth();
  const [ratings, setRatings] = useState<MyRating[]>([]);
  const [redemptions, setRedemptions] = useState<MyRedemption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    Promise.all([
      supabase
        .from("ratings")
        .select("id, spot_id, score, created_at, spots(name)")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("redemptions")
        .select("id, status, redeemed_at, created_at, spots(name), promotions(discount_type, discount_value)")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false }),
    ]).then(([ratingsRes, redemptionsRes]) => {
      if (cancelled) return;

      setRatings(
        (ratingsRes.data ?? []).map((row: any) => ({
          id: row.id,
          spot_id: row.spot_id,
          spot_name: row.spots?.name ?? "Unbekannter Spot",
          score: row.score,
          created_at: row.created_at,
        }))
      );

      setRedemptions(
        (redemptionsRes.data ?? []).map((row: any) => ({
          id: row.id,
          spot_name: row.spots?.name ?? "Unbekannter Spot",
          discount_type: row.promotions?.discount_type ?? "percent",
          discount_value: row.promotions?.discount_value ?? 0,
          status: row.status,
          redeemed_at: row.redeemed_at,
          created_at: row.created_at,
        }))
      );

      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [session]);

  return { ratings, redemptions, loading };
}
