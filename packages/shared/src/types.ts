// Datenbank-Modelle, gespiegelt aus docs/spec.md Abschnitt 4.

export type UserRole = "consumer" | "creator" | "business";

export interface User {
  id: string;
  email: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export type SpotCategory =
  | "food"
  | "shopping"
  | "experience"
  | "nightlife"
  | "beauty"
  | "culture";

export interface OpeningHours {
  mon?: string;
  tue?: string;
  wed?: string;
  thu?: string;
  fri?: string;
  sat?: string;
  sun?: string;
}

export interface Spot {
  id: string;
  name: string;
  description: string | null;
  category: SpotCategory;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  google_place_id: string | null;
  phone: string | null;
  website: string | null;
  opening_hours: OpeningHours | null;
  photos: string[];
  score: number;
  score_count: number;
  save_count: number;
  claimed_by: string | null;
  is_claimed: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Rating {
  id: string;
  spot_id: string;
  user_id: string;
  score: number; // 1-100
  comment: string | null;
  created_at: string;
}

export interface Save {
  user_id: string;
  spot_id: string;
  created_at: string;
}

export type VideoPlatform = "tiktok" | "instagram" | "youtube";

export interface SpotVideo {
  id: string;
  spot_id: string;
  creator_id: string;
  platform: VideoPlatform;
  video_url: string;
  thumbnail_url: string | null;
  title: string | null;
  is_cooperation: boolean;
  created_at: string;
}

export type SubscriptionTier = "basis" | "aktiv" | "premium";
export type SubscriptionStatus = "active" | "canceled" | "past_due" | "trialing";

export interface Subscription {
  id: string;
  business_id: string;
  tier: SubscriptionTier;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
}

export type DiscountType = "percent" | "fixed";

export interface Promotion {
  id: string;
  spot_id: string;
  business_id: string;
  title: string;
  description: string | null;
  discount_type: DiscountType;
  discount_value: number;
  max_redemptions: number | null;
  current_redemptions: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
}

export interface PromoCode {
  id: string;
  promotion_id: string;
  creator_id: string;
  code: string;
  is_active: boolean;
  created_at: string;
}

export type RedemptionStatus = "generated" | "redeemed" | "expired";

export interface Redemption {
  id: string;
  promo_code_id: string;
  promotion_id: string;
  user_id: string;
  creator_id: string;
  spot_id: string;
  qr_token: string;
  qr_expires_at: string;
  fallback_code: string | null;
  status: RedemptionStatus;
  redeemed_at: string | null;
  redeemed_by_staff: string | null;
  creator_payout: number;
  platform_fee: number;
  created_at: string;
}

export type PayoutStatus = "pending" | "paid" | "failed";

export interface CreatorPayout {
  id: string;
  creator_id: string;
  amount: number;
  redemption_count: number;
  period_start: string;
  period_end: string;
  status: PayoutStatus;
  stripe_transfer_id: string | null;
  created_at: string;
}
