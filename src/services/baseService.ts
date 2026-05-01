// src/services/baseService.ts
// Reusable base service for all verticals with common CRUD operations

import { VerticalConfig } from '../types/vertical';
import { Listing, ListingFilters } from '../types/listing';
import { getAuthToken } from '../auth/firebaseClient';
import { LOG_API_RESPONSE } from '../config/appConfig';

interface FetchOptions {
  fallback?: string;
  timeout?: number;
}

async function fetchJsonWithFallback(url: string, options: FetchOptions = {}): Promise<any> {
  try {
    const controller = new AbortController();
    const timeout = options.timeout || 5000;
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (LOG_API_RESPONSE) {
        console.log(`[BaseService] Data fetched from ${url}`, data);
      }
      return data;
    }
  } catch (err) {
    if (LOG_API_RESPONSE) {
      console.log(`[BaseService] Fetch failed for ${url}:`, err);
    }
  }

  // Return null on failure to allow caller to handle fallback
  return null;
}

export class BaseVerticalService {
  vertical: string;
  config: VerticalConfig;
  cacheState: {
    data: any[];
    timestamp: number;
    pendingPromise: Promise<any[]> | null;
  };

  constructor(vertical: string, config: VerticalConfig) {
    this.vertical = vertical;
    this.config = config;
    this.cacheState = {
      data: [],
      timestamp: 0,
      pendingPromise: null
    };
  }

  /**
   * Get all listings for this vertical with optional filters
   */
  async getAll(filters: ListingFilters = {}): Promise<Listing[]> {
    const query = new URLSearchParams(
      Object.entries(filters).reduce((acc, [key, val]) => {
        if (val !== null && val !== undefined && val !== '') {
          acc[key] = String(val);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString();

    const separator = this.config.endpoints.list.includes('?') ? '&' : '?';
    const url = `${this.config.apiUrl}${this.config.endpoints.list}${query ? separator + query : ''}`;
    
    // Try primary API
    let data = await fetchJsonWithFallback(url);
    
    // If primary fails and we have a fallback URL, try that
    if ((!data || data.length === 0) && this.config.fallbackUrl) {
      if (LOG_API_RESPONSE) {
        console.log(`[BaseService] Primary fetch failed for ${this.vertical}, trying fallback: ${this.config.fallbackUrl}`);
      }
      data = await fetchJsonWithFallback(this.config.fallbackUrl);
    }
    
    return data || [];
  }

  /**
   * Get single listing by ID
   */
  async getById(id: string | number): Promise<Listing | null> {
    // Usually getById is an endpoint like /offers/123
    const url = `${this.config.apiUrl}${this.config.endpoints.list}/${id}`;
    let data = await fetchJsonWithFallback(url);
    
    // If primary fails, we might need to find it in the fallback list
    if (!data && this.config.fallbackUrl) {
      const all = await fetchJsonWithFallback(this.config.fallbackUrl);
      return all?.find((item: Listing) => String(item.id) === String(id)) || null;
    }
    
    // Some APIs return a single object, some return an array with one object
    if (Array.isArray(data)) {
      return data.length > 0 ? data[0] : null;
    }
    
    return data || null;
  }

  /**
   * Search listings (text search)
   */
  async search(query: string): Promise<Listing[]> {
    return this.getAll({ search: query });
  }

  /**
   * Create new listing (FormData or JSON)
   */
  async create(data: Listing, formData?: FormData): Promise<Listing> {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Authentication required. Please login.');
      }

      const url = `${this.config.apiUrl}${this.config.endpoints.create}`;
      const body = formData || JSON.stringify(data);
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
      };

      // Only set Content-Type for JSON (not FormData, browser handles that)
      if (!formData) {
        headers['Content-Type'] = 'application/json';
      }

      const res = await fetch(url, {
        method: 'POST',
        body,
        headers
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to create ${this.vertical} listing`);
      }

      return await res.json();
    } catch (err) {
      console.error(`[${this.vertical}Service] create error:`, err);
      throw err;
    }
  }

  /**
   * Update listing (FormData or JSON)
   */
  async update(id: string | number, data: Listing, formData?: FormData): Promise<Listing> {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Authentication required. Please login.');
      }

      const endpoint = this.config.endpoints.update.replace('{id}', String(id));
      const url = `${this.config.apiUrl}${endpoint}`;
      const body = formData || JSON.stringify(data);
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
      };

      if (!formData) {
        headers['Content-Type'] = 'application/json';
      }

      const res = await fetch(url, {
        method: 'PUT',
        body,
        headers
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to update ${this.vertical} listing`);
      }

      return await res.json();
    } catch (err) {
      console.error(`[${this.vertical}Service] update error:`, err);
      throw err;
    }
  }

  /**
   * Delete listing
   */
  async delete(id: string | number): Promise<any> {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Authentication required. Please login.');
      }

      const endpoint = this.config.endpoints.delete.replace('{id}', String(id));
      const url = `${this.config.apiUrl}${endpoint}`;

      const res = await fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to delete ${this.vertical} listing`);
      }

      return await res.json();
    } catch (err) {
      console.error(`[${this.vertical}Service] delete error:`, err);
      throw err;
    }
  }

  /**
   * Bulk activate listings
   */
  async activate(ids: (string | number)[], apiKey: string): Promise<any> {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Authentication required. Please login.');
      }

      const endpoint = this.config.endpoints.activate;
      const url = `${this.config.apiUrl}${endpoint}`;

      const res = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-api-token': apiKey,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids, apiKey })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to activate ${this.vertical} listings`);
      }

      return await res.json();
    } catch (err) {
      console.error(`[${this.vertical}Service] activate error:`, err);
      throw err;
    }
  }

  /**
   * Bulk inactivate listings
   */
  async inactivate(ids: (string | number)[], apiKey: string): Promise<any> {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Authentication required. Please login.');
      }

      const endpoint = this.config.endpoints.inactivate;
      const url = `${this.config.apiUrl}${endpoint}`;

      const res = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-api-token': apiKey,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids, apiKey })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to inactivate ${this.vertical} listings`);
      }

      return await res.json();
    } catch (err) {
      console.error(`[${this.vertical}Service] inactivate error:`, err);
      throw err;
    }
  }

  /**
   * Get image URL for a listing
   */
  getImageUrl(id: string | number): string {
    const endpoint = this.config.endpoints.getImage.replace('{id}', String(id));
    return `${this.config.apiUrl}${endpoint}`;
  }
}
