import { useCallback, useEffect, useState } from "react";
import type { Subscription, SubscriptionTier } from "@spot/shared";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";

interface SubscriptionState {
  subscription: Subscription | null;
  loading: boolean;
  choosing: boolean;
  chooseTier: (tier: SubscriptionTier) => Promise<void>;
}

export function useSubscription(): SubscriptionState {
  const { session } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [choosing, setChoosing] = useState(false);

  const load = useCallback(async () => {
    if (!session) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("business_id", session.user.id)
      .in("status", ["active", "trialing"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setSubscription((data as Subscription | null) ?? null);
    setLoading(false);
  }, [session]);

  useEffect(() => {
    load();
  }, [load]);

  async function chooseTier(tier: SubscriptionTier) {
    if (!session) return;
    setChoosing(true);

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setDate(periodEnd.getDate() + 30);

    await supabase.from("subscriptions").insert({
      business_id: session.user.id,
      tier,
      status: "trialing",
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
    });

    setChoosing(false);
    load();
  }

  return { subscription, loading, choosing, chooseTier };
}
