// src/config/routes.ts
// Route definitions for the application

export const routes = {
  // Main
  HOME: '/',
  
  // Verticals - Dynamic routes
  VERTICAL: '/:vertical',
  VERTICAL_DETAIL: '/:vertical/:id',
  
  // Legacy routes (for backward compatibility)
  RESTAURANTS: '/restaurants',
  RESTAURANTS_DETAIL: '/restaurants/:id',
  OFFER_DETAIL: '/offer/:id',
  CUISINES: '/cuisines',
  ALL_RESTAURANTS: '/all-restaurants',
  
  // User features
  FAVORITES: '/favourites',
  ABOUT: '/about',
  TERMS: '/terms',
  
  // Admin
  ADMIN: '/admin',
  ADMIN_GUIDE: '/admin-guide',
  MANAGE_OFFERS: '/manage-offers',
  MAKE_OFFER: '/make-offer',
  
  // Catch-all
  NOT_FOUND: '*'
};

export default routes;
