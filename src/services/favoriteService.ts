import { BASE_API } from "../config/apiConfig";
import { getAuthToken } from "../auth/firebaseClient";
import type { FavoritePreference, FavoriteRecord } from "../types/favorite";

const FAVORITES_URL = `${BASE_API}/favorites`;

async function authenticatedRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getAuthToken();
  if (!token) throw new Error("Sign in to sync favorites with your account.");
  const response = await fetch(`${FAVORITES_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `Favorites request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

export interface FavoriteApiRecord extends FavoriteRecord {
  _id?: string;
  userId?: string;
  id?: number | string;
  createdAt?: string;
  updatedAt?: string;
}

export async function fetchAccountFavorites() {
  return authenticatedRequest<{ favorites: FavoriteApiRecord[]; preferences: FavoritePreference | null }>("");
}

export async function mergeAccountFavorites(favorites: FavoriteRecord[]) {
  return authenticatedRequest<{ favorites: FavoriteApiRecord[] }>("/sync", {
    method: "PUT",
    body: JSON.stringify({ favorites }),
  });
}

export async function saveAccountFavorite(favorite: FavoriteRecord) {
  const path = `/${encodeURIComponent(favorite.source)}/${encodeURIComponent(favorite.verticalId)}/${encodeURIComponent(favorite.itemId)}`;
  return authenticatedRequest<FavoriteApiRecord>(path, {
    method: "PUT",
    body: JSON.stringify({ snapshot: favorite.snapshot }),
  });
}

export async function deleteAccountFavorite(favorite: FavoriteRecord) {
  const path = `/${encodeURIComponent(favorite.source)}/${encodeURIComponent(favorite.verticalId)}/${encodeURIComponent(favorite.itemId)}`;
  return authenticatedRequest<{ deleted: boolean }>(path, { method: "DELETE" });
}

export async function getNotificationPreferences() {
  return authenticatedRequest<FavoritePreference | null>("/preferences");
}

export async function saveNotificationPreferences(preferences: FavoritePreference) {
  return authenticatedRequest<FavoritePreference>("/preferences", {
    method: "PUT",
    body: JSON.stringify(preferences),
  });
}

export async function verifyNotificationEmail(token: string) {
  const response = await fetch(`${FAVORITES_URL}/verify-email/${encodeURIComponent(token)}`);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `Email verification failed (${response.status})`);
  }
  return response.json() as Promise<{ message: string }>;
}
