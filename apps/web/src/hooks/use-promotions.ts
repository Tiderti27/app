import { useCallback, useEffect, useState } from "react";
import type { DiscountType, Promotion } from "@spot/shared";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";

export interface PromoCodeWithCreator {
  id: string;
  code: string;
  creator_username: string;
}

export interface PromotionWithCodes extends Promotion {
  codes: PromoCodeWithCreator[];
}

interface CreatePromotionInput {
  title: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  maxRedemptions: number | null;
  validUntil: string | null;
}

interface UsePromotionsResult {
  spotId: string | null;
  spotName: string | null;
  promotions: PromotionWithCodes[];
  loading: boolean;
  createPromotion: (input: CreatePromotionInput) => Promise<string | null>;
  setActive: (promotionId: string, isActive: boolean) => Promise<void>;
  linkCreator: (promotionId: string, username: string, code: string) => Promise<string | null>;
  refresh: () => void;
}

export function usePromotions(): UsePromotionsResult {
  const { session } = useAuth();
  const [spotId, setSpotId] = useState<string | null>(null);
  const [spotName, setSpotName] = useState<string | null>(null);
  const [promotions, setPromotions] = useState<PromotionWithCodes[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!session) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const { data: spot } = await supabase
      .from("spots_view")
      .select("id, name")
      .eq("claimed_by", session.user.id)
      .maybeSingle();

    if (!spot) {
      setSpotId(null);
      setSpotName(null);
      setPromotions([]);
      setLoading(false);
      return;
    }

    setSpotId(spot.id);
    setSpotName(spot.name);

    const { data: promoData } = await supabase
      .from("promotions")
      .select("*")
      .eq("business_id", session.user.id)
      .order("created_at", { ascending: false });

    const promoList = (promoData ?? []) as Promotion[];

    const { data: codeData } = await supabase
      .from("promo_codes")
      .select("id, code, promotion_id, users(username)")
      .in("promotion_id", promoList.map((p) => p.id).length > 0 ? promoList.map((p) => p.id) : ["00000000-0000-0000-0000-000000000000"]);

    const codesByPromotion = new Map<string, PromoCodeWithCreator[]>();
    for (const row of (codeData ?? []) as any[]) {
      const list = codesByPromotion.get(row.promotion_id) ?? [];
      list.push({ id: row.id, code: row.code, creator_username: row.users?.username ?? "?" });
      codesByPromotion.set(row.promotion_id, list);
    }

    setPromotions(
      promoList.map((promo) => ({ ...promo, codes: codesByPromotion.get(promo.id) ?? [] }))
    );
    setLoading(false);
  }, [session]);

  useEffect(() => {
    load();
  }, [load]);

  async function createPromotion(input: CreatePromotionInput): Promise<string | null> {
    if (!session || !spotId) return "Kein Spot vorhanden";

    const { error } = await supabase.from("promotions").insert({
      spot_id: spotId,
      business_id: session.user.id,
      title: input.title,
      description: input.description || null,
      discount_type: input.discountType,
      discount_value: input.discountValue,
      max_redemptions: input.maxRedemptions,
      valid_from: new Date().toISOString(),
      valid_until: input.validUntil,
      is_active: true,
    });

    if (error) return error.message;
    load();
    return null;
  }

  async function setActive(promotionId: string, isActive: boolean) {
    await supabase.from("promotions").update({ is_active: isActive }).eq("id", promotionId);
    load();
  }

  async function linkCreator(promotionId: string, username: string, code: string): Promise<string | null> {
    const { data: creator } = await supabase
      .from("users")
      .select("id")
      .eq("username", username.trim())
      .eq("role", "creator")
      .maybeSingle();

    if (!creator) return "Kein Creator mit diesem Nutzernamen gefunden.";

    const { error } = await supabase.from("promo_codes").insert({
      promotion_id: promotionId,
      creator_id: creator.id,
      code: code.trim().toUpperCase(),
    });

    if (error) return error.message.includes("duplicate") ? "Dieser Code ist bereits vergeben." : error.message;
    load();
    return null;
  }

  return { spotId, spotName, promotions, loading, createPromotion, setActive, linkCreator, refresh: load };
}
