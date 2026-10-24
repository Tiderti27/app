import { useCallback, useEffect, useState } from "react";
import type { RedeemResult } from "@spot/shared";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";

interface RedemptionState {
  promotionActive: boolean;
  checking: boolean;
  redemption: RedeemResult | null;
  redeeming: boolean;
  error: string | null;
  redeem: (code: string) => Promise<void>;
  reset: () => void;
}

export function useRedemption(spotId: string): RedemptionState {
  const { session } = useAuth();
  const [promotionActive, setPromotionActive] = useState(false);
  const [checking, setChecking] = useState(true);
  const [redemption, setRedemption] = useState<RedeemResult | null>(null);
  const [redeeming, setRedeeming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setChecking(true);

    supabase
      .from("promotions")
      .select("id")
      .eq("spot_id", spotId)
      .eq("is_active", true)
      .lte("valid_from", new Date().toISOString())
      .or(`valid_until.is.null,valid_until.gte.${new Date().toISOString()}`)
      .limit(1)
      .then(({ data }) => {
        if (cancelled) return;
        setPromotionActive(Boolean(data && data.length > 0));
        setChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [spotId]);

  const redeem = useCallback(
    async (code: string) => {
      if (!session || !code.trim()) return;
      setRedeeming(true);
      setError(null);

      const { data, error: redeemError } = await supabase.rpc("redeem_promo_code", { p_code: code.trim() });

      setRedeeming(false);

      if (redeemError) {
        setError(redeemError.message.replace(/^.*: /, ""));
        return;
      }

      const result = Array.isArray(data) ? data[0] : data;
      setRedemption((result ?? null) as RedeemResult | null);
    },
    [session]
  );

  const reset = useCallback(() => {
    setRedemption(null);
    setError(null);
  }, []);

  return { promotionActive, checking, redemption, redeeming, error, redeem, reset };
}
