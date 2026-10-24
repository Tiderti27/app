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

export type ThemeMode = "light" | "dark";

export interface ColorPalette {
  bgPrimary: string;
  bgSecondary: string;
  bgCard: string;
  bgElevated: string;
  accentPrimary: string;
  accentSecondary: string;
  scoreColor: string;
  scoreHigh: string;
  scoreMid: string;
  scoreLow: string;
  // Getoente Hintergruende fuer Score-Badges (wie im Design-Entwurf: feste
  // Farbpaare statt berechneter Transparenz).
  scoreHighTint: string;
  scoreMidTint: string;
  scoreLowTint: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
}

// docs/spec.md Abschnitt 10 - Design-Richtlinien (Dark, Standard)
export const DARK_COLORS: ColorPalette = {
  bgPrimary: "#0b0b10",
  bgSecondary: "#16161f",
  bgCard: "#16161f",
  bgElevated: "#1e1e2a",
  accentPrimary: "#8b5cf6",
  accentSecondary: "#a78bfa",
  scoreColor: "#fbbf24",
  scoreHigh: "#4ade80",
  scoreMid: "#fbbf24",
  scoreLow: "#fb7185",
  scoreHighTint: "#1d2a20",
  scoreMidTint: "#2a2316",
  scoreLowTint: "#2a1a1c",
  textPrimary: "#f5f4f7",
  textSecondary: "#9c99ab",
  border: "#27262f",
};

// Helle Variante: gleiche Markenfarben, aber bewusst kein reines Weiss -
// ein heller Grauton als Seitenhintergrund, Karten etwas heller darueber,
// fuer ausreichenden Kontrast auf dem Grund nachjustiert (reines Dark-
// Gold/-Gruen waere auf Hellgrau zu kontrastarm).
export const LIGHT_COLORS: ColorPalette = {
  bgPrimary: "#eceaf0",
  bgSecondary: "#e1dfe6",
  bgCard: "#f5f4f7",
  bgElevated: "#ffffff",
  accentPrimary: "#7c3aed",
  accentSecondary: "#8b5cf6",
  scoreColor: "#d97706",
  scoreHigh: "#16a34a",
  scoreMid: "#d97706",
  scoreLow: "#dc2626",
  scoreHighTint: "#dcfce7",
  scoreMidTint: "#fef3c7",
  scoreLowTint: "#fee2e2",
  textPrimary: "#18181b",
  textSecondary: "#6b6878",
  border: "#d6d3dd",
};

export const THEMES: Record<ThemeMode, ColorPalette> = {
  dark: DARK_COLORS,
  light: LIGHT_COLORS,
};

// Rueckwaertskompatibel fuer Code, der noch den statischen Default erwartet.
export const COLORS = DARK_COLORS;

export function scoreColor(score: number, colors: ColorPalette = DARK_COLORS): string {
  if (score >= 80) return colors.scoreHigh;
  if (score >= 50) return colors.scoreMid;
  return colors.scoreLow;
}

export function scoreTint(score: number, colors: ColorPalette = DARK_COLORS): string {
  if (score >= 80) return colors.scoreHighTint;
  if (score >= 50) return colors.scoreMidTint;
  return colors.scoreLowTint;
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
