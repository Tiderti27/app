import { useCallback, useEffect, useState } from "react";
import type { User } from "@spot/shared";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/auth-context";

export function useSettings() {
  const { session } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    const { data } = await supabase.from("users").select("*").eq("id", session.user.id).single();
    setUser((data as User) ?? null);
    setLoading(false);
  }, [session]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateUsername(username: string): Promise<{ error: string | null }> {
    if (!session) return { error: "Nicht angemeldet." };
    const { error } = await supabase.from("users").update({ username }).eq("id", session.user.id);
    if (!error) setUser((prev) => (prev ? { ...prev, username } : prev));
    return { error: error?.message ?? null };
  }

  async function setNotificationPref(
    key: "notify_promotions" | "notify_saved_updates",
    value: boolean
  ): Promise<{ error: string | null }> {
    if (!session) return { error: "Nicht angemeldet." };
    setUser((prev) => (prev ? { ...prev, [key]: value } : prev));
    const { error } = await supabase.from("users").update({ [key]: value }).eq("id", session.user.id);
    if (error) setUser((prev) => (prev ? { ...prev, [key]: !value } : prev));
    return { error: error?.message ?? null };
  }

  async function requestAccountDeletion(reason: string): Promise<{ error: string | null }> {
    const { error } = await supabase.rpc("request_account_deletion", { p_reason: reason || null });
    return { error: error?.message ?? null };
  }

  return { user, loading, updateUsername, setNotificationPref, requestAccountDeletion, refresh: load };
}
