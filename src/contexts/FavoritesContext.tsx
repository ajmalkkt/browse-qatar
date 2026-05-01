import React, { createContext, useCallback, useEffect, useState } from 'react';
import { getOfferById } from '../services/offerService';

export interface FavoriteOffer {
  id: number;
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
}

type FavoritesContextType = {
  favorites: FavoriteOffer[];
  isLoading: boolean;
  lastRefreshed: Date | null;
  addFavorite: (offer: FavoriteOffer) => void;
  removeFavorite: (id: number) => void;
  toggleFavorite: (offer: FavoriteOffer) => void;
  isFavorite: (id: number) => boolean;
  refreshFavorites: () => Promise<void>;
};

const FAVORITES_KEY = 'dineDealsFavourites';

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<FavoriteOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  // load from storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) setFavorites(JSON.parse(stored));
    } catch (err) {
      console.error('FavoritesProvider: failed to load from storage', err);
    } finally {
      setIsLoading(false);
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === FAVORITES_KEY) {
        try {
          const parsed = e.newValue ? JSON.parse(e.newValue) : [];
          setFavorites(parsed);
        } catch (err) {
          console.error('FavoritesProvider: error parsing storage event', err);
        }
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // persist
  useEffect(() => {
    // Do not persist while we're still loading initial data — this prevents
    // the initial empty state from overwriting saved favorites on mount.
    if (isLoading) return;
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (err) {
      console.error('FavoritesProvider: failed to save to storage', err);
    }
  }, [favorites, isLoading]);

  const addFavorite = useCallback((offer: FavoriteOffer) => {
    setFavorites((prev) => {
      if (prev.find((p) => p.id === offer.id)) return prev;
      return [...prev, offer];
    });
  }, []);

  const removeFavorite = useCallback((id: number) => {
    setFavorites((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const isFavorite = useCallback((id: number) => favorites.some((f) => f.id === id), [favorites]);

  const toggleFavorite = useCallback((offer: FavoriteOffer) => {
    setFavorites((prev) => {
      if (prev.find((p) => p.id === offer.id)) return prev.filter((p) => p.id !== offer.id);
      return [...prev, offer];
    });
  }, []);

  const refreshFavorites = useCallback(async () => {
    try {
      const latest = await Promise.all(
        favorites.map(async (fav) => {
          try {
            const fresh = await getOfferById(fav.id);
            return fresh ? { ...fav, ...fresh } : fav;
          } catch (err) {
            return fav;
          }
        })
      );
      setFavorites(latest as FavoriteOffer[]);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('FavoritesProvider: refresh failed', err);
    }
  }, [favorites]);

  const value: FavoritesContextType = {
    favorites,
    isLoading,
    lastRefreshed,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    refreshFavorites,
  };

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
};

export const useFavoritesContext = () => {
  const ctx = React.useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavoritesContext must be used inside FavoritesProvider');
  return ctx;
};

export default FavoritesContext;
