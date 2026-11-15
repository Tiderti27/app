import { useCallback, useEffect, useState } from "react";
import type { BusinessRedemptionToday, ScanResult } from "@spot/shared";
import { supabase } from "@/lib/supabase";

interface ScannerState {
  today: BusinessRedemptionToday[];
  loadingToday: boolean;
  lastResult: ScanResult | null;
  error: string | null;
  scanning: boolean;
  submitToken: (token: string) => Promise<void>;
  submitFallbackCode: (code: string) => Promise<void>;
  clearResult: () => void;
}

export function useScanner(): ScannerState {
  const [today, setToday] = useState<BusinessRedemptionToday[]>([]);
  const [loadingToday, setLoadingToday] = useState(true);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  const loadToday = useCallback(async () => {
    setLoadingToday(true);
    const { data } = await supabase.rpc("business_redemptions_today");
    setToday((data ?? []) as BusinessRedemptionToday[]);
    setLoadingToday(false);
  }, []);

  useEffect(() => {
    loadToday();
  }, [loadToday]);

  async function runScan(params: { p_qr_token?: string; p_fallback_code?: string }) {
    setScanning(true);
    setError(null);

    const { data, error: scanError } = await supabase.rpc("scan_redemption", params);

    setScanning(false);

    if (scanError) {
      setError(scanError.message.replace(/^.*: /, ""));
      return;
    }

    const result = Array.isArray(data) ? data[0] : data;
    setLastResult((result ?? null) as ScanResult | null);
    loadToday();
  }

  return {
    today,
    loadingToday,
    lastResult,
    error,
    scanning,
    submitToken: (token) => runScan({ p_qr_token: token }),
    submitFallbackCode: (code) => runScan({ p_fallback_code: code.trim() }),
    clearResult: () => {
      setLastResult(null);
      setError(null);
    },
  };
}
