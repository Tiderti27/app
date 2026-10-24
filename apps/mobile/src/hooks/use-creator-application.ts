import { useCallback, useEffect, useState } from "react";
import type { CreatorApplication } from "@spot/shared";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";

interface CreatorApplicationState {
  application: CreatorApplication | null;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  submit: (input: { tiktok: string; instagram: string; youtube: string; message: string }) => Promise<void>;
}

export function useCreatorApplication(enabled: boolean): CreatorApplicationState {
  const { session } = useAuth();
  const [application, setApplication] = useState<CreatorApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!enabled || !session) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("creator_applications")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setApplication((data as CreatorApplication | null) ?? null);
    setLoading(false);
  }, [enabled, session]);

  useEffect(() => {
    load();
  }, [load]);

  async function submit(input: { tiktok: string; instagram: string; youtube: string; message: string }) {
    setSubmitting(true);
    setError(null);

    const { error: submitError } = await supabase.rpc("apply_for_creator", {
      p_tiktok: input.tiktok.trim() || null,
      p_instagram: input.instagram.trim() || null,
      p_youtube: input.youtube.trim() || null,
      p_message: input.message.trim() || null,
    });

    setSubmitting(false);

    if (submitError) {
      setError(submitError.message.replace(/^.*: /, ""));
      return;
    }

    load();
  }

  return { application, loading, submitting, error, submit };
}
