// src/config/verticalConfig.ts
// Vertical configuration - defines all available verticals and their settings

import { VerticalConfig } from '../types/vertical';

export const verticalConfig: Record<string, VerticalConfig> = {
  restaurants: {
    id: 'restaurants',
    name: 'Restaurants Deal',
    icon: 'UtensilsCrossed',
    color: '#8B1538',
    route: '/restaurants-offers',
    enabled: true,
    apiUrl: import.meta.env.VITE_BASE_API || '',
    
    endpoints: {
      list: '/offers',
      create: '/offers',
      update: '/offers/{id}',
      delete: '/offers/{id}',
      getImage: '/offers/{id}/image',
      inactivate: '/inactivate',
      activate: '/bulk-activate'
    },
    
    filters: {
      cuisine: { type: 'multiselect', source: 'cuisineOptions' },
      location: { type: 'search' },
      priceRange: { type: 'range', min: 0, max: 100 },
      rating: { type: 'star', max: 5 }
    },
    
    sortOptions: ['popular', 'rating', 'newest', 'priceLow', 'priceHigh'],
    featuredImage: 'https://images.unsplash.com/photo-1542528406-f04308dcf0a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxyZXN0YXVyYW50JTIwZm9vZCUyMGRpc2hlcyUyMGNvbG9yZnVsfGVufDF8fHx8MTc3NzE5NDc0MXww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Discover amazing restaurant offers and deals',
    features: ['offers', 'ratings', 'reviews', 'search'],
    fallbackUrl: '/data/offers.json'
  },

  vehicles: {
    id: 'vehicles',
    name: 'Vehicles Buy & Sell',
    icon: 'Car',
    color: '#1E3A8A',
    route: '/vehicles',
    enabled: true,
    apiUrl: import.meta.env.VITE_BASE_API || '',
    
    endpoints: {
      list: '/listings?vertical=vehicles',
      create: '/listings',
      update: '/listings/{id}',
      delete: '/listings/{id}',
      getImage: '/listings/{id}/image',
      inactivate: '/listings/inactivate',
      activate: '/listings/bulk-activate'
    },
    
    filters: {
      make: { type: 'select', source: 'vehicleMakes' },
      model: { type: 'select', source: 'vehicleModels', dependsOn: 'make' },
      yearMin: { type: 'number', min: 1990, max: new Date().getFullYear() },
      yearMax: { type: 'number', min: 1990, max: new Date().getFullYear() },
      priceRange: { type: 'range', min: 1000, max: 500000 },
      condition: { type: 'select', options: ['New', 'Used', 'Refurbished'] },
      fuelType: { type: 'multiselect', options: ['Petrol', 'Diesel', 'Electric', 'Hybrid'] }
    },
    
    sortOptions: ['popular', 'priceLow', 'priceHigh', 'newest', 'mileage'],
    featuredImage: 'https://images.unsplash.com/photo-1632979676233-fa62116edc09?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBjYXJzJTIwdmVoaWNsZXN8ZW58MXx8fHwxNzc3MTk0NzQxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Buy and sell vehicles with verified dealers',
    features: ['listings', 'search', 'filter'],
    fallbackUrl: '/data/vehicles.json'
  },

  accommodations: {
    id: 'accommodations',
    name: 'Accommodation',
    icon: 'Home',
    color: '#059669',
    route: '/accommodations',
    enabled: true,
    apiUrl: import.meta.env.VITE_BASE_API || '',
    
    endpoints: {
      list: '/listings?vertical=accommodations',
      create: '/listings',
      update: '/listings/{id}',
      delete: '/listings/{id}',
      getImage: '/listings/{id}/image',
      inactivate: '/listings/inactivate',
      activate: '/listings/bulk-activate'
    },
    
    filters: {
      type: { type: 'multiselect', options: ['Apartment', 'Villa', 'House', 'Room'] },
      bedrooms: { type: 'number', min: 0, max: 10 },
      priceRange: { type: 'range', min: 100, max: 10000 },
      amenities: { type: 'multiselect', options: ['AC', 'WiFi', 'Parking', 'Pool', 'Gym', 'Garden'] }
    },
    
    sortOptions: ['popular', 'priceLow', 'priceHigh', 'newest'],
    featuredImage: 'https://images.unsplash.com/photo-1765124540398-d717b5b06f23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxtb2Rlcm4lMjBob3VzZSUyMGFjY29tbW9kYXRpb24lMjBwcm9wZXJ0eXxlbnwxfHx8fDE3NzcxOTQ3NDF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Find perfect accommodation for your stay',
    features: ['listings', 'search', 'filter'],
    fallbackUrl: '/data/accommodations.json'
  },

  services: {
    id: 'services',
    name: 'Services',
    icon: 'Wrench',
    color: '#D97706',
    route: '/services',
    enabled: true,
    apiUrl: import.meta.env.VITE_BASE_API || '',
    
    endpoints: {
      list: '/listings?vertical=services',
      create: '/listings',
      update: '/listings/{id}',
      delete: '/listings/{id}',
      getImage: '/listings/{id}/image',
      inactivate: '/listings/inactivate',
      activate: '/listings/bulk-activate'
    },
    
    filters: {
      category: { type: 'select', options: ['Cleaning', 'Repairs', 'Maintenance', 'IT Support', 'Delivery', 'Other'] },
      experience: { type: 'select', options: ['0-1 years', '1-3 years', '3-5 years', '5+ years'] },
      rating: { type: 'star', max: 5 },
      priceRange: { type: 'range', min: 10, max: 10000 }
    },
    
    sortOptions: ['popular', 'rating', 'newest', 'experience', 'priceLow', 'priceHigh'],
    featuredImage: 'https://images.unsplash.com/photo-1762087021974-b0729f37a8fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxwcm9mZXNzaW9uYWwlMjBzZXJ2aWNlcyUyMHdvcmtlcnN8ZW58MXx8fHwxNzc3MTk0NzQyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Find professional services near you',
    features: ['listings', 'search', 'filter', 'ratings'],
    fallbackUrl: '/data/services.json'
  },

  classifieds: {
    id: 'classifieds',
    name: 'Classifieds Buy & Sell',
    icon: 'Package',
    color: '#7C3AED',
    route: '/classifieds',
    enabled: true,
    apiUrl: import.meta.env.VITE_BASE_API || '',
    
    endpoints: {
      list: '/listings?vertical=classifieds',
      create: '/listings',
      update: '/listings/{id}',
      delete: '/listings/{id}',
      getImage: '/listings/{id}/image',
      inactivate: '/listings/inactivate',
      activate: '/listings/bulk-activate'
    },
    
    filters: {
      category: { type: 'select', options: ['Electronics', 'Furniture', 'Books', 'Clothing', 'Sports', 'Other'] },
      condition: { type: 'select', options: ['New', 'Like New', 'Good', 'Fair'] },
      priceRange: { type: 'range', min: 1, max: 100000 }
    },
    
    sortOptions: ['newest', 'priceLow', 'priceHigh'],
    featuredImage: 'https://images.unsplash.com/photo-1567016546367-c27a0d56712e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxmdXJuaXR1cmUlMjBpbnRlcmlvciUyMGhvbWUlMjBkZWNvcnxlbnwxfHx8fDE3NzcxOTQ3NDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Buy and sell items in your neighborhood',
    features: ['listings', 'search', 'filter'],
    fallbackUrl: '/data/classifieds.json'
  },

  jobs: {
    id: 'jobs',
    name: 'Job Listing',
    icon: 'Briefcase',
    color: '#DC2626',
    route: '/jobs',
    enabled: true,
    apiUrl: import.meta.env.VITE_BASE_API || '',
    
    endpoints: {
      list: '/listings?vertical=jobs',
      create: '/listings',
      update: '/listings/{id}',
      delete: '/listings/{id}',
      getImage: '/listings/{id}/image',
      inactivate: '/listings/inactivate',
      activate: '/listings/bulk-activate'
    },
    
    filters: {
      jobType: { type: 'multiselect', options: ['Full-time', 'Part-time', 'Contract', 'Freelance'] },
      level: { type: 'select', options: ['Entry', 'Mid', 'Senior', 'Executive'] },
      salaryMin: { type: 'number', min: 0, max: 1000000 },
      salaryMax: { type: 'number', min: 0, max: 1000000 }
    },
    
    sortOptions: ['newest', 'salaryHigh', 'salaryLow'],
    featuredImage: 'https://images.unsplash.com/photo-1758518730083-4c12527b6742?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxidXNpbmVzcyUyMHByb2Zlc3Npb25hbHMlMjBvZmZpY2UlMjBwcm9wZXJ0eXxlbnwxfHx8fDE3NzcxOTQ5Mzh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Explore job opportunities in your field',
    features: ['listings', 'search', 'filter'],
    fallbackUrl: '/data/jobs.json'
  }
};

// Get all enabled verticals - driven by VITE_SHOW_* env flags
export function getEnabledVerticals(): VerticalConfig[] {
  const envFlags: Record<string, boolean> = {
    restaurants:    import.meta.env.VITE_SHOW_RESTAURANTS !== 'false',
    vehicles:       import.meta.env.VITE_SHOW_VEHICLES === 'true',
    accommodations: import.meta.env.VITE_SHOW_ACCOMMODATIONS === 'true',
    services:       import.meta.env.VITE_SHOW_SERVICES === 'true',
    classifieds:    import.meta.env.VITE_SHOW_CLASSIFIEDS === 'true',
    jobs:           import.meta.env.VITE_SHOW_JOBS === 'true',
  };
  return Object.values(verticalConfig).filter(v => envFlags[v.id] ?? false);
}

// Get vertical by ID
export function getVertical(id: string): VerticalConfig | null {
  return verticalConfig[id] || null;
}
