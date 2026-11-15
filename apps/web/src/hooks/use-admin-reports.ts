import { useCallback, useEffect, useState } from "react";
import type { ReportStatus, ReportWithSpot } from "@spot/shared";
import { supabase } from "@/lib/supabase";

export function useAdminReports() {
  const [reports, setReports] = useState<ReportWithSpot[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("reports")
      .select("*, spots(name)")
      .eq("status", "open")
      .order("created_at", { ascending: true });

    setReports(
      ((data ?? []) as Array<Record<string, unknown> & { spots: { name: string } | null }>).map((row) => ({
        ...(row as unknown as ReportWithSpot),
        spot_name: row.spots?.name ?? "Unbekannter Spot",
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function resolveReport(reportId: string, status: Extract<ReportStatus, "resolved" | "dismissed">) {
    const { data: sessionData } = await supabase.auth.getSession();
    await supabase
      .from("reports")
      .update({ status, resolved_at: new Date().toISOString(), resolved_by: sessionData.session?.user.id ?? null })
      .eq("id", reportId);
    load();
  }

  return { reports, loading, resolveReport, refresh: load };
}
