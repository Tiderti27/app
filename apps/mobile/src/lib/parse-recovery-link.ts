export interface RecoveryTokens {
  accessToken: string;
  refreshToken: string;
}

// Supabase haengt die Tokens eines Passwort-Reset-Links als URL-Fragment an
// (nach "#", nicht als normale "?"-Query), z.B.
// spot://reset-password#access_token=...&refresh_token=...&type=recovery
// Deshalb hier manuell parsen statt expo-router/Linking's Query-Parsing zu
// nutzen, das Fragmente nicht automatisch erfasst.
export function parseRecoveryLink(url: string): RecoveryTokens | null {
  const fragment = url.split("#")[1];
  if (!fragment) return null;

  const params = new URLSearchParams(fragment);
  if (params.get("type") !== "recovery") return null;

  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  if (!accessToken || !refreshToken) return null;

  return { accessToken, refreshToken };
}
