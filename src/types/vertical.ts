// src/types/vertical.ts
// Vertical/Category type definitions for multi-vertical marketplace

export enum VerticalType {
  RESTAURANTS = 'restaurants',
  VEHICLES = 'vehicles',
  ACCOMMODATIONS = 'accommodations',
  CLASSIFIEDS = 'classifieds',
  SERVICES = 'services',
  JOBS = 'jobs'
}

export interface FilterOption {
  type: 'text' | 'select' | 'multiselect' | 'range' | 'number' | 'star' | 'search' | 'dependent';
  source?: string; // 'cuisineOptions', 'vehicleMakes', etc.
  options?: string[];
  min?: number;
  max?: number;
  dependsOn?: string; // for dependent filters (e.g., model depends on make)
}

export interface Filters {
  [key: string]: FilterOption;
}

export interface Endpoints {
  list: string;
  create: string;
  update: string;
  delete: string;
  getImage: string;
  inactivate: string;
  activate: string;
}

export interface VerticalConfig {
  id: string;
  name: string;
  icon: string; // lucide-react icon name
  color: string; // hex color for branding
  route: string; // e.g., '/restaurants'
  enabled: boolean;
  apiUrl: string; // base API URL for this vertical
  endpoints: Endpoints;
  filters: Filters;
  sortOptions: string[];
  featuredImage: string;
  description: string;
  features?: string[]; // ['offers', 'ratings', 'reviews']
  fallbackUrl?: string;
}

export interface VerticalContextType {
  currentVertical: string;
  currentConfig: VerticalConfig | null;
  verticals: VerticalConfig[];
  switchVertical: (verticalId: string) => void;
}
