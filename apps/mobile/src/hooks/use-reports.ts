import { useState } from "react";
import type { ReportTargetType } from "@spot/shared";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/auth-context";

interface SubmitReportInput {
  spotId: string;
  targetType: ReportTargetType;
  reason: string;
  photoUrl?: string | null;
}

export function useReports() {
  const { session } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  async function submitReport(input: SubmitReportInput): Promise<{ error: string | null }> {
    if (!session) return { error: "Nicht angemeldet." };
    setSubmitting(true);
    const { error } = await supabase.from("reports").insert({
      reporter_id: session.user.id,
      spot_id: input.spotId,
      target_type: input.targetType,
      photo_url: input.photoUrl ?? null,
      reason: input.reason,
    });
    setSubmitting(false);
    return { error: error?.message ?? null };
  }

  return { submitReport, submitting };
}
