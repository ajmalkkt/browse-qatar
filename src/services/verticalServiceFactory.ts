// src/services/verticalServiceFactory.ts
// Service factory for creating and caching vertical service instances

import { verticalConfig } from '../config/verticalConfig';
import { BaseVerticalService } from './baseService';

const serviceCache: Record<string, BaseVerticalService> = {};

/**
 * Get or create a service instance for a vertical
 * Services are cached to avoid recreating them
 */
export function getVerticalService(verticalId: string): BaseVerticalService {
  // Check if already cached
  if (serviceCache[verticalId]) {
    return serviceCache[verticalId];
  }

  // Get config for this vertical
  const config = verticalConfig[verticalId];
  if (!config) {
    throw new Error(`Unknown vertical: ${verticalId}`);
  }

  // Create new service instance
  const service = new BaseVerticalService(verticalId, config);
  serviceCache[verticalId] = service;

  return service;
}

/**
 * Get service for restaurants (backward compatible)
 */
export function getRestaurantService(): BaseVerticalService {
  return getVerticalService('restaurants');
}

/**
 * Clear all cached services (useful for testing or logging out)
 */
export function clearServiceCache(): void {
  Object.keys(serviceCache).forEach(key => {
    delete serviceCache[key];
  });
}

// Pre-create services for commonly used verticals
export const restaurantService = getVerticalService('restaurants');
export const vehicleService = getVerticalService('vehicles');
export const accommodationService = getVerticalService('accommodations');
export const serviceService = getVerticalService('services');
export const classifiedService = getVerticalService('classifieds');
export const jobService = getVerticalService('jobs');

export default {
  getVerticalService,
  getRestaurantService,
  clearServiceCache,
  restaurantService,
  vehicleService,
  accommodationService,
  serviceService,
  classifiedService,
  jobService
};
