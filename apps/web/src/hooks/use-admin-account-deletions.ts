import { useCallback, useEffect, useState } from "react";
import type { AccountDeletionRequestWithUser } from "@spot/shared";
import { supabase } from "@/lib/supabase";

export function useAdminAccountDeletions() {
  const [requests, setRequests] = useState<AccountDeletionRequestWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    // "users!user_id" ist noetig, weil account_deletion_requests ZWEI
    // Fremdschluessel zu users hat (user_id, resolved_by) -- ohne die Angabe
    // ist der Embed mehrdeutig und Postgrest antwortet mit 300.
    const { data } = await supabase
      .from("account_deletion_requests")
      .select("*, users!user_id(username, email)")
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    setRequests(
      (
        (data ?? []) as Array<Record<string, unknown> & { users: { username: string; email: string } | null }>
      ).map((row) => ({
        ...(row as unknown as AccountDeletionRequestWithUser),
        username: row.users?.username ?? "Unbekannt",
        email: row.users?.email ?? "-",
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function resolveRequest(requestId: string) {
    await supabase.rpc("admin_resolve_account_deletion", { p_request_id: requestId });
    load();
  }

  return { requests, loading, resolveRequest, refresh: load };
}
