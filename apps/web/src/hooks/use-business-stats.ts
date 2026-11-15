import { useEffect, useState } from "react";
import type { BusinessRedemptionToday, BusinessStats } from "@spot/shared";
import { supabase } from "@/lib/supabase";

interface BusinessStatsState {
  stats: BusinessStats | null;
  todayRedemptions: BusinessRedemptionToday[];
  loading: boolean;
}

export function useBusinessStats(days = 7): BusinessStatsState {
  const [stats, setStats] = useState<BusinessStats | null>(null);
  const [todayRedemptions, setTodayRedemptions] = useState<BusinessRedemptionToday[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([
      supabase.rpc("business_stats", { p_days: days }),
      supabase.rpc("business_redemptions_today"),
    ]).then(([statsRes, todayRes]) => {
      if (cancelled) return;
      const statsRow = Array.isArray(statsRes.data) ? statsRes.data[0] : statsRes.data;
      setStats((statsRow ?? null) as BusinessStats | null);
      setTodayRedemptions((todayRes.data ?? []) as BusinessRedemptionToday[]);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [days]);

  return { stats, todayRedemptions, loading };
}
