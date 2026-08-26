import type { SpotCategory, SubscriptionTier } from "./types";

// docs/spec.md Abschnitt 7.1
export const SPOT_CATEGORIES: { value: SpotCategory; label: string }[] = [
  { value: "food", label: "Food" },
  { value: "shopping", label: "Shopping" },
  { value: "experience", label: "Experience" },
  { value: "nightlife", label: "Nightlife" },
  { value: "beauty", label: "Beauty" },
  { value: "culture", label: "Culture" },
];

// docs/spec.md Abschnitt 10 - Design-Richtlinien
export const COLORS = {
  bgPrimary: "#0f0f14",
  bgSecondary: "#1a1a24",
  bgCard: "#22222e",
  accentPrimary: "#8b5cf6",
  accentSecondary: "#a78bfa",
  scoreColor: "#fbbf24",
  scoreHigh: "#22c55e",
  scoreMid: "#fbbf24",
  scoreLow: "#ef4444",
  textPrimary: "#f8fafc",
  textSecondary: "#94a3b8",
  border: "#334155",
} as const;

export function scoreColor(score: number): string {
  if (score >= 80) return COLORS.scoreHigh;
  if (score >= 50) return COLORS.scoreMid;
  return COLORS.scoreLow;
}

// docs/spec.md Abschnitt 8 - Laden-Abos
export const SUBSCRIPTION_PRICING: Record<SubscriptionTier, { label: string; priceEur: number }> = {
  basis: { label: "Basis", priceEur: 19 },
  aktiv: { label: "Aktiv", priceEur: 39 },
  premium: { label: "Premium", priceEur: 69 },
};

// docs/spec.md Abschnitt 5 / 8 - Rabattcode-Ablauf
export const QR_CODE_VALIDITY_MINUTES = 15;
export const CREATOR_PAYOUT_PER_REDEMPTION_EUR = 0.5;
export const PLATFORM_FEE_PER_REDEMPTION_EUR = 0.5;

// docs/spec.md Abschnitt 6 - Bayesian Average Parameter
export const SCORE_MIN_VOTES_FOR_FULL_WEIGHT = 10;
