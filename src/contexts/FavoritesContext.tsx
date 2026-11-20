import React, { createContext, useCallback, useEffect, useRef, useState } from "react";
import useAuth from "../auth/useAuth";
import {
  deleteAccountFavorite,
  fetchAccountFavorites,
  mergeAccountFavorites,
  saveAccountFavorite,
  type FavoriteApiRecord,
} from "../services/favoriteService";
import type { FavoriteRecord, FavoriteSource } from "../types/favorite";

export interface FavoriteOffer {
  id: number | string;
  title: string;
  description: string;
  restaurantId: number;
  cuisine: string;
  originalPrice: number;
  discountedPrice: number;
  offerType: string;
  validFrom: string;
  validTo: string;
  imageUrl: string;
  location: string;
  country?: string;
  category?: string;
  source?: FavoriteSource;
  verticalId?: string;
  itemId?: string;
  pricing?: { originalPrice?: number | string; discountedPrice?: number | string; currency?: string; unit?: string };
  attributes?: Record<string, unknown>;
  availability?: boolean;
}

type FavoritesContextType = {
  favorites: FavoriteOffer[];
  isLoading: boolean;
  lastRefreshed: Date | null;
  syncError: string | null;
  isSignedIn: boolean;
  addFavorite: (favorite: FavoriteOffer) => void;
  removeFavorite: (id: number | string, source?: FavoriteSource, verticalId?: string) => void;
  toggleFavorite: (favorite: FavoriteOffer) => void;
  isFavorite: (id: number | string, source?: FavoriteSource, verticalId?: string) => boolean;
  refreshFavorites: () => Promise<void>;
  syncFavorites: () => Promise<void>;
};

const FAVORITES_KEY = "dineDealsFavourites";
const ACCOUNT_FAVORITES_KEY = "dineDealsFavourites:";
const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

function sourceOf(favorite: FavoriteOffer): FavoriteSource {
  return favorite.source || "offer";
}

function verticalOf(favorite: FavoriteOffer): string {
  return favorite.verticalId || (sourceOf(favorite) === "offer" ? "restaurants" : "classifieds");
}

function recordOf(favorite: FavoriteOffer): FavoriteRecord {
  const source = sourceOf(favorite);
  return {
    source,
    verticalId: verticalOf(favorite),
    itemId: String(favorite.itemId ?? favorite.id),
    snapshot: {
      title: favorite.title,
      name: source === "offer" ? favorite.title : undefined,
      category: favorite.category,
      imageUrl: favorite.imageUrl,
      price: Number(favorite.pricing?.discountedPrice ?? favorite.discountedPrice) || 0,
      originalPrice: Number(favorite.pricing?.originalPrice ?? favorite.originalPrice) || 0,
      currency: favorite.pricing?.currency || "QAR",
      location: favorite.location,
    },
  };
}

function fromApiRecord(record: FavoriteApiRecord): FavoriteOffer {
  const snapshot = record.snapshot || {};
  const id = record.itemId || record.id || "";
  const price = snapshot.price ?? 0;
  const source = record.source;
  return {
    id,
    itemId: String(id),
    source,
    verticalId: record.verticalId,
    title: snapshot.title || snapshot.name || "Saved item",
    description: "",
    restaurantId: 0,
    cuisine: "",
    originalPrice: snapshot.originalPrice ?? price,
    discountedPrice: price,
    offerType: source === "offer" ? "Offer" : "",
    validFrom: "",
    validTo: "",
    imageUrl: snapshot.imageUrl || "",
    location: snapshot.location || "",
    category: snapshot.category || record.verticalId,
    pricing: { originalPrice: snapshot.originalPrice ?? price, discountedPrice: price, currency: snapshot.currency || "QAR" },
  };
}

function normalizeStoredFavorites(value: unknown): FavoriteOffer[] {
  if (!Array.isArray(value)) return [];
  return value.filter((favorite): favorite is FavoriteOffer =>
    Boolean(favorite && typeof favorite === "object" && "id" in favorite)
  ).map((favorite) => {
    const item = favorite as FavoriteOffer;
    return {
      ...item,
      source: item.source || "offer",
      verticalId: item.verticalId || (item.source === "listing" ? "classifieds" : "restaurants"),
      itemId: String(item.itemId ?? item.id),
    };
  });
}

function identity(favorite: FavoriteOffer): string {
  return `${sourceOf(favorite)}:${verticalOf(favorite)}:${String(favorite.itemId ?? favorite.id)}`;
}

function mergeByIdentity(...groups: FavoriteOffer[][]): FavoriteOffer[] {
  const merged = new Map<string, FavoriteOffer>();
  for (const group of groups) {
    for (const favorite of group) merged.set(identity(favorite), favorite);
  }
  return [...merged.values()];
}

function readLocalFavorites(key: string): FavoriteOffer[] {
  try {
    return normalizeStoredFavorites(JSON.parse(localStorage.getItem(key) || "[]"));
  } catch (error) {
    console.error("FavoritesProvider: failed to read favorites from storage", error);
    return [];
  }
}

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, initialized } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const favoritesRef = useRef(favorites);
  const accountIdRef = useRef<string | null>(null);
  const previousAccountRef = useRef<string | null>(null);
  const syncedAccountRef = useRef<string | null>(null);
  const pendingRemovalsRef = useRef(new Map<string, Map<string, FavoriteRecord>>());
  const mutationQueueRef = useRef(new Map<string, Map<string, Promise<unknown>>>());
  const activeAccountId = typeof user?.uid === "string" ? user.uid : null;
  favoritesRef.current = favorites;
  accountIdRef.current = accountId;

  useEffect(() => {
    setFavorites(readLocalFavorites(FAVORITES_KEY));
    setIsLoading(false);

    const onStorage = (event: StorageEvent) => {
      if (event.key === FAVORITES_KEY && !accountIdRef.current) {
        try {
          setFavorites(normalizeStoredFavorites(event.newValue ? JSON.parse(event.newValue) : []));
        } catch (error) {
          console.error("FavoritesProvider: invalid cross-tab storage event", error);
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (isLoading || !initialized) return;
    if (!activeAccountId) {
      if (previousAccountRef.current) {
        setFavorites(readLocalFavorites(FAVORITES_KEY));
        previousAccountRef.current = null;
        setSyncError(null);
      }
      setAccountId(null);
      syncedAccountRef.current = null;
      return;
    }
    if (previousAccountRef.current && previousAccountRef.current !== activeAccountId) {
      setFavorites(readLocalFavorites(FAVORITES_KEY));
    }
    previousAccountRef.current = activeAccountId;
    setAccountId(activeAccountId);
    if (syncedAccountRef.current === activeAccountId) return;
    syncedAccountRef.current = activeAccountId;
    let active = true;
    const syncOnSignIn = async () => {
      const guestFavorites = readLocalFavorites(FAVORITES_KEY);
      try {
        const response = guestFavorites.length
          ? await mergeAccountFavorites(guestFavorites.map(recordOf))
          : await fetchAccountFavorites();
        if (!active) return;
        const serverFavorites = response.favorites.map(fromApiRecord);
        const merged = mergeByIdentity(serverFavorites, guestFavorites);
        if (guestFavorites.length) localStorage.removeItem(FAVORITES_KEY);
        localStorage.setItem(`${ACCOUNT_FAVORITES_KEY}${activeAccountId}`, JSON.stringify(merged));
        setFavorites(merged);
        setSyncError(null);
      } catch (error) {
        if (!active) return;
        console.error("FavoritesProvider: account synchronization failed", error);
        setSyncError(error instanceof Error ? error.message : "Unable to synchronize favorites.");
      }
    };
    void syncOnSignIn();
    return () => { active = false; };
  }, [activeAccountId, initialized, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    const key = accountId ? `${ACCOUNT_FAVORITES_KEY}${accountId}` : FAVORITES_KEY;
    try {
      localStorage.setItem(key, JSON.stringify(favorites));
    } catch (error) {
      console.error("FavoritesProvider: failed to save favorites to storage", error);
      setSyncError("Favorites could not be saved in this browser.");
    }
  }, [accountId, favorites, isLoading]);

  const persistFavoriteChange = useCallback((favorite: FavoriteOffer, removing: boolean) => {
    if (!accountId) return Promise.resolve();
    const record = recordOf(favorite);
    const key = identity(favorite);
    let accountRemovals = pendingRemovalsRef.current.get(accountId);
    if (!accountRemovals) {
      accountRemovals = new Map<string, FavoriteRecord>();
      pendingRemovalsRef.current.set(accountId, accountRemovals);
    }
    let accountQueue = mutationQueueRef.current.get(accountId);
    if (!accountQueue) {
      accountQueue = new Map<string, Promise<unknown>>();
      mutationQueueRef.current.set(accountId, accountQueue);
    }
    if (removing) accountRemovals.set(key, record);
    else accountRemovals.delete(key);
    const previousMutation = accountQueue.get(key) || Promise.resolve();
    const request = previousMutation
      .catch(() => undefined)
      .then(async () => {
        if (removing) await deleteAccountFavorite(record);
        else await saveAccountFavorite(record);
      });
    accountQueue.set(key, request);
    void request.then(() => {
      if (removing && accountRemovals?.get(key) === record) {
        accountRemovals.delete(key);
      }
      setSyncError(null);
    }).catch((error: unknown) => {
      console.error("FavoritesProvider: account favorite update failed", error);
      setSyncError(error instanceof Error ? error.message : "Unable to sync this favorite.");
    }).finally(() => {
      if (accountQueue?.get(key) === request) accountQueue.delete(key);
      if (accountQueue?.size === 0) mutationQueueRef.current.delete(accountId);
    });
    return request;
  }, [accountId]);

  const addFavorite = useCallback((favorite: FavoriteOffer) => {
    setFavorites((previous) => {
      const merged = mergeByIdentity(previous, [favorite]);
      return merged;
    });
    persistFavoriteChange(favorite, false);
  }, [persistFavoriteChange]);

  const removeFavorite = useCallback((id: number | string, source?: FavoriteSource, verticalId?: string) => {
    const matches = favoritesRef.current.filter((favorite) =>
      String(favorite.itemId ?? favorite.id) === String(id) &&
      (!source || sourceOf(favorite) === source) &&
      (!verticalId || verticalOf(favorite) === verticalId)
    );
    setFavorites((previous) => previous.filter((favorite) => !matches.some((match) => identity(match) === identity(favorite))));
    matches.forEach((favorite) => persistFavoriteChange(favorite, true));
  }, [persistFavoriteChange]);

  const toggleFavorite = useCallback((favorite: FavoriteOffer) => {
    const exists = favoritesRef.current.some((item) => identity(item) === identity(favorite));
    if (exists) {
      removeFavorite(favorite.itemId ?? favorite.id, sourceOf(favorite), verticalOf(favorite));
      return;
    }
    addFavorite(favorite);
  }, [addFavorite, removeFavorite]);

  const isFavorite = useCallback((id: number | string, source?: FavoriteSource, verticalId?: string) =>
    favorites.some((favorite) =>
      String(favorite.itemId ?? favorite.id) === String(id) &&
      (!source || sourceOf(favorite) === source) &&
      (!verticalId || verticalOf(favorite) === verticalId)
    ), [favorites]);

  const syncFavorites = useCallback(async () => {
    let response = await mergeAccountFavorites(favoritesRef.current.map(recordOf));
    const accountRemovals = activeAccountId ? pendingRemovalsRef.current.get(activeAccountId) : undefined;
    const accountQueue = activeAccountId ? mutationQueueRef.current.get(activeAccountId) : undefined;
    const pendingRemovals = [...(accountRemovals || new Map<string, FavoriteRecord>()).entries()];
    await Promise.all(pendingRemovals.map(async ([key, record]) => {
      const previousMutation = accountQueue?.get(key);
      if (previousMutation) await previousMutation.catch(() => undefined);
      await deleteAccountFavorite(record);
      if (accountRemovals?.get(key) === record) accountRemovals.delete(key);
    }));
    if (pendingRemovals.length) response = await fetchAccountFavorites();
    const serverFavorites = response.favorites.map(fromApiRecord);
    const merged = mergeByIdentity(serverFavorites, favoritesRef.current);
    if (activeAccountId) {
      localStorage.setItem(`${ACCOUNT_FAVORITES_KEY}${activeAccountId}`, JSON.stringify(merged));
      localStorage.removeItem(FAVORITES_KEY);
    }
    setFavorites(merged);
    setSyncError(null);
  }, [activeAccountId]);

  const refreshFavorites = useCallback(async () => {
    if (accountId) {
      const response = await fetchAccountFavorites();
      const remote = response.favorites.map(fromApiRecord);
      setFavorites(remote);
    }
    setLastRefreshed(new Date());
  }, [accountId]);

  const value: FavoritesContextType = {
    favorites,
    isLoading,
    lastRefreshed,
    syncError,
    isSignedIn: Boolean(accountId),
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    refreshFavorites,
    syncFavorites,
  };

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
};

export const useFavoritesContext = () => {
  const context = React.useContext(FavoritesContext);
  if (!context) throw new Error("useFavoritesContext must be used inside FavoritesProvider");
  return context;
};

export default FavoritesContext;
