import { useCallback, useEffect, useState } from "react";
import type { OpeningHours, Spot, SpotCategory, User } from "@spot/shared";
import { supabase } from "@/lib/supabase";

export interface SpotFormInput {
  name: string;
  description: string;
  category: SpotCategory;
  address: string;
  city: string;
  latitude: string;
  longitude: string;
  openingHours: OpeningHours;
  claimedBy: string | null;
}

interface AdminSpotsState {
  spots: Spot[];
  businesses: User[];
  loading: boolean;
  createSpot: (input: SpotFormInput) => Promise<string | null>;
  updateSpot: (id: string, input: SpotFormInput) => Promise<string | null>;
  deleteSpot: (id: string) => Promise<void>;
  refresh: () => void;
}

export function useAdminSpots(): AdminSpotsState {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [businesses, setBusinesses] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [spotsRes, businessesRes] = await Promise.all([
      supabase.from("spots_view").select("*").order("created_at", { ascending: false }),
      supabase.from("users").select("*").eq("role", "business").order("username"),
    ]);
    setSpots((spotsRes.data ?? []) as Spot[]);
    setBusinesses((businessesRes.data ?? []) as User[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function toPayload(input: SpotFormInput) {
    const lat = Number(input.latitude);
    const lng = Number(input.longitude);
    return {
      name: input.name,
      description: input.description || null,
      category: input.category,
      address: input.address,
      city: input.city,
      opening_hours: input.openingHours,
      location: `POINT(${lng} ${lat})`,
      claimed_by: input.claimedBy,
      is_claimed: Boolean(input.claimedBy),
    };
  }

  async function createSpot(input: SpotFormInput): Promise<string | null> {
    const lat = Number(input.latitude);
    const lng = Number(input.longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return "Breiten- und Längengrad müssen Zahlen sein.";

    const { error } = await supabase.from("spots").insert(toPayload(input));
    if (error) return error.message;
    load();
    return null;
  }

  async function updateSpot(id: string, input: SpotFormInput): Promise<string | null> {
    const lat = Number(input.latitude);
    const lng = Number(input.longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return "Breiten- und Längengrad müssen Zahlen sein.";

    const { error } = await supabase.from("spots").update(toPayload(input)).eq("id", id);
    if (error) return error.message;
    load();
    return null;
  }

  async function deleteSpot(id: string) {
    await supabase.from("spots").delete().eq("id", id);
    load();
  }

  return { spots, businesses, loading, createSpot, updateSpot, deleteSpot, refresh: load };
}
