// src/types/listing.ts
// Generic listing type for all verticals

export interface Pricing {
  originalPrice?: number | string;
  discountedPrice?: number | string;
  currency?: string;
  unit?: string;
}

export interface Validity {
  from?: string;
  to?: string;
}

export interface Location {
  city?: string;
  country?: string;
  coordinates?: { lat: number; lng: number };
}

// Generic attributes object - keys depend on vertical
export interface ListingAttributes {
  [key: string]: any;
  // Examples:
  // restaurants: { cuisine: 'North Indian', offerType: 'Buffet', servingSize: '2-3' }
  // vehicles: { make: 'Toyota', model: 'Camry', year: 2023, condition: 'Used' }
  // accommodations: { bedrooms: 2, type: 'Apartment', amenities: ['AC', 'WiFi'] }
  // services: { category: 'Cleaning', experience: '3+ years' }
}

export interface Listing {
  id: number | string;
  vertical: string; // 'restaurants', 'vehicles', etc.
  title: string;
  description?: string;
  
  // Provider reference
  providerId: number | string;
  providerType?: string; // 'restaurant', 'dealer', 'landlord', etc.
  
  // Pricing
  pricing?: Pricing;
  
  // Validity/Expiry
  validity?: Validity;
  
  // Location
  location?: Location;
  
  // Flexible category and attributes per vertical
  category?: string;
  subcategory?: string;
  attributes?: ListingAttributes;
  
  // Media
  imageUrl?: string;
  galleryUrls?: string[];
  
  // Metadata
  rating?: number;
  reviews?: number;
  status?: 'active' | 'inactive' | 'pending' | 'archived';
  
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
  
  // Original offer structure for backward compatibility
  cuisine?: string; // restaurants
  originalPrice?: number | string;
  discountedPrice?: number | string;
  offerType?: string;
  validFrom?: string;
  validTo?: string;
  restaurantId?: number; // for backward compatibility
  ownerLogin?: string;
  additionalAttributes?: any;
  unit?: string;
}

export interface ListingFilters {
  [key: string]: any;
}
