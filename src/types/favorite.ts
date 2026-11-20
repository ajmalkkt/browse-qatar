export type FavoriteSource = "listing" | "offer";

export interface FavoriteSnapshot {
  title?: string;
  name?: string;
  category?: string;
  imageUrl?: string;
  price?: number;
  originalPrice?: number;
  currency?: string;
  location?: string;
}

export interface FavoriteRecord {
  source: FavoriteSource;
  verticalId: string;
  itemId: string;
  snapshot: FavoriteSnapshot;
}

export interface FavoritePreference {
  enabled: boolean;
  email: string;
  emailVerified: boolean;
  cadence: "daily" | "weekly" | "monthly" | "once";
  oneTimeDate?: string;
  categories: string[];
  timezone: string;
  endDate?: string;
}
