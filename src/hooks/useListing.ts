// src/hooks/useListing.ts
// Hook for fetching and managing listings from a vertical

import { useState, useEffect, useCallback } from 'react';
import { getVerticalService } from '../services/verticalServiceFactory';
import { Listing, ListingFilters } from '../types/listing';

interface UseListingOptions {
  verticalId: string;
  filters?: ListingFilters;
  skip?: boolean;
}

interface UseListingResult {
  listings: Listing[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  setFilters: (filters: ListingFilters) => void;
}

/**
 * Hook for fetching listings from any vertical
 * @param options - Configuration options
 * @returns listings, loading state, error, and control functions
 */
export function useListing(options: UseListingOptions): UseListingResult {
  const { verticalId, filters = {}, skip = false } = options;
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentFilters, setCurrentFilters] = useState<ListingFilters>(filters);

  const fetchListings = useCallback(async () => {
    if (skip) return;

    setLoading(true);
    setError(null);

    try {
      const service = getVerticalService(verticalId);
      const data = await service.getAll(currentFilters);
      setListings(data || []);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error(`[useListing] Error fetching ${verticalId} listings:`, err);
    } finally {
      setLoading(false);
    }
  }, [verticalId, currentFilters, skip]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const refetch = useCallback(async () => {
    await fetchListings();
  }, [fetchListings]);

  const setFilters = useCallback((newFilters: ListingFilters) => {
    setCurrentFilters(newFilters);
  }, []);

  return {
    listings,
    loading,
    error,
    refetch,
    setFilters
  };
}

/**
 * Hook for fetching a single listing by ID
 */
export function useListingById(verticalId: string, id?: string | number) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchListing = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const service = getVerticalService(verticalId);
      const data = await service.getById(id);
      setListing(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error(`[useListingById] Error fetching listing:`, err);
    } finally {
      setLoading(false);
    }
  }, [verticalId, id]);

  useEffect(() => {
    fetchListing();
  }, [fetchListing]);

  return {
    listing,
    loading,
    error,
    refetch: fetchListing
  };
}

export default {
  useListing,
  useListingById
};
