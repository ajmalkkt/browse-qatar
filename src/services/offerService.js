// Service for offers. Returns Promises so UI components can consume the same API
// whether data comes from local JSON or a backend endpoint later.

import { act } from 'react';
import { OFFERS_URL } from '../config/apiConfig';
import { LOG_API_RESPONSE } from '../config/appConfig';
import { getAuthToken } from '../auth/firebaseClient';

//Get the auth token for admin operations
export async function getAdminAuthToken() {
  // 1. Get the Firebase Token automatically
  const token = await getAuthToken();

  if (!token) {
    console.warn("User is not authenticated. Please login...");
    // You could also throw an error here to stop the request immediately
    throw new Error("Authentication required");
  }
  return token;
}

async function fetchJsonWithFallback(url, fallbackUrl) {
  try {
    const res = await fetch(url);
    if (res.ok) {
      if (LOG_API_RESPONSE && typeof window !== 'undefined') {
        window.__offerDataSource = 'API';
        console.log('[OfferService] Data fetched from API:', url);
      }
      return await res.json();
    }
  } catch (err) {
    // fall through to fallback fetch
  }

  if (LOG_API_RESPONSE && typeof window !== 'undefined') {
    window.__offerDataSource = 'NONE';
    console.log('[OfferService] No offer data found.');
  }
  console.log('[OfferService] No offer data found.');
  return [];
}

async function loadOffers() {
  // Use public/data/offers.json as fallback for production
  return await fetchJsonWithFallback(OFFERS_URL, '/data/offers.json');
}

// Public methods to get offers
export async function getAllOffers() {
  return await loadOffers();
}

export async function getOfferById(id) {
  const offers = await loadOffers();
  const nid = typeof id === 'string' ? Number(id) : id;
  return offers.find((o) => o.id === nid) || null;
}

export async function getOffersByRestaurantId(restaurantId) {
  const offers = await loadOffers();
  const rid = typeof restaurantId === 'string' ? Number(restaurantId) : restaurantId;
  return offers.filter((o) => o.restaurantId === rid);
}

export async function getOffersByOwnerRestaurantId(restaurantId) {
  const res = await fetch(`${OFFERS_URL}/${restaurantId}/restaurant`);
  if (!res.ok) throw new Error("Failed to get offers by owner restaurant id");
  return await res.json();
}

export async function searchOffersByCuisine(cuisine) {
  const res = await fetch(`${OFFERS_URL}/search/${encodeURIComponent(cuisine)}`);
  if (!res.ok) throw new Error("Failed to search offers");
  return await res.json();
}

// === ADMIN METHODS ===

// Upload or update an offer with image
export async function uploadOffer(formData, options = {}) {
  try {
    const token = await getAdminAuthToken();
    const res = await fetch(`${OFFERS_URL}`, {
      method: 'POST',
      body: formData,
      headers: {
        ...(options.headers || {}), // pass x-api-token here
        'Authorization': `Bearer ${token}`,
        // Note: If sending JSON, ensure 'Content-Type': 'application/json' is in options.headers
        // If sending FormData, do NOT set Content-Type manually.
      },
    });
    if (!res.ok) {
      //extract the message field from response json
      const errorData = await res.json();
      const errorMessage = errorData.message || 'Failed to upload offer';
      //console.error('[OfferService] uploadOffer error details:', errorData);
      throw new Error(errorMessage);
    }
    return await res.json();
  } catch (err) {
    console.error('[OfferService] uploadOffer error:', err);
    throw err;
  }
}

// Update an offer
export async function updateOffer(id, formData, options = {}) {
  try {
    const token = await getAdminAuthToken();
    const res = await fetch(`${OFFERS_URL}/${id}`, {
      method: 'PUT',
      body: formData,
      headers: {
        ...(options.headers || {}),
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const errorData = await res.json();
      const errorMessage = errorData.message || 'Failed to update offer';
      throw new Error(errorMessage);
    }
    return await res.json();
  } catch (err) {
    console.error('[OfferService] updateOffer error:', err);
    throw err;
  }
}

// Delete offer by ID
export async function deleteOffer(id, options = {}) {
  try {
    const token = await getAdminAuthToken();
    const res = await fetch(`${OFFERS_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        ...(options.headers || {}), // pass x-api-token here
        'Authorization': `Bearer ${token}`,
        // Note: If sending JSON, ensure 'Content-Type': 'application/json' is in options.headers
        // If sending FormData, do NOT set Content-Type manually.
      },
    });
    if (!res.ok) {
      const errorData = await res.json();
      const errorMessage = errorData.message || 'Failed to delete offer';
      throw new Error(errorMessage);
    }
    return await res.json();
  } catch (err) {
    console.error('[OfferService] deleteOffer error:', err);
    throw err;
  }
}

//activate offers  router.patch("/activate/:id", verifyApiToken, activateOffer);
export async function activateOffer(id, options = {}) {
  try {
    const token = await getAdminAuthToken();
    const res = await fetch(`${OFFERS_URL}/activate/${id}`, {
      method: 'PATCH',
      headers: {
        ...(options.headers || {}), // pass x-api-token here
        'Authorization': `Bearer ${token}`,
        // Note: If sending JSON, ensure 'Content-Type': 'application/json' is in options.headers
        // If sending FormData, do NOT set Content-Type manually.
      },
    });
    if (!res.ok) throw new Error('Failed to activate offer');
    return await res.json();
  } catch (err) {
    console.error('[OfferService] activateOffer error:', err);
    throw err;
  }
}

export async function getInactiveOffers() {
  const res = await fetch(`${OFFERS_URL}/all/inactive`);
  if (!res.ok) throw new Error("Failed to fetch inactive offers");
  return res.json();
}

export async function activateOffers(payload) {
  const token = await getAdminAuthToken();
  const res = await fetch(`${OFFERS_URL}/bulk-activate`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "x-api-token": payload.apiKey, "Authorization": `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    //extract the message field from response json
    const errorData = await res.json();
    const errorMessage = errorData.message || 'Failed to activate offers';
    //console.error('[OfferService] activateOffers error details:', errorData);
    throw new Error(errorMessage);
  }
  return res.json();
}

//getAllActiveOffers
export async function getAllActiveOffers() {
  //add token
  const res = await fetch(`${OFFERS_URL}/all/active`);
  if (!res.ok) throw new Error("Failed to fetch active offers");
  return res.json();
}

//inactivate offers
export async function inactivateOffers(payload) {
  const token = await getAdminAuthToken();
  const res = await fetch(`${OFFERS_URL}/inactivate`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "x-api-token": payload.apiKey, "Authorization": `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    //extract the message field from response json
    const errorData = await res.json();
    const errorMessage = errorData.message || 'Failed to inactivate offers';
    //console.error('[OfferService] inactivateOffers error details:', errorData);
    throw new Error(errorMessage);
  }
  return res.json();
}

// Get offer image URL
export function getOfferImageUrl(id) {
  return `${OFFERS_URL}/${id}/image`;
}
// --- offerService.js ---
//export const getOfferImageUrl = (offerId) =>
//  `${import.meta.env.VITE_API_BASE_URL}/api/offers/${offerId}/image`;


export default {
  getAllOffers,
  getOfferById,
  getOffersByRestaurantId,
  uploadOffer,
  deleteOffer,
  getOfferImageUrl,
  activateOffer,
  activateOffers,
  getInactiveOffers,
  searchOffersByCuisine,
  updateOffer,
};
