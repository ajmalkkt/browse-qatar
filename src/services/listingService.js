// Service for generic listings (verticals). Returns Promises so UI components can consume the same API
import { LISTINGS_URL } from '../config/apiConfig';
import { getAuthToken } from '../auth/firebaseClient';

// Get the auth token for admin operations
export async function getAdminAuthToken() {
  const token = await getAuthToken();

  if (!token) {
    console.warn("User is not authenticated. Please login...");
    throw new Error("Authentication required");
  }
  return token;
}

// Upload a new listing with images
export async function uploadListing(formData, options = {}) {
  try {
    const token = await getAdminAuthToken();
    const res = await fetch(`${LISTINGS_URL}`, {
      method: 'POST',
      body: formData,
      headers: {
        ...(options.headers || {}),
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const errorData = await res.json();
      const errorMessage = errorData.message || 'Failed to upload listing';
      throw new Error(errorMessage);
    }
    return await res.json();
  } catch (err) {
    console.error('[ListingService] uploadListing error:', err);
    throw err;
  }
}

// Update an existing listing
export async function updateListing(id, formData, options = {}) {
  try {
    const token = await getAdminAuthToken();
    const res = await fetch(`${LISTINGS_URL}/${id}`, {
      method: 'PUT',
      body: formData,
      headers: {
        ...(options.headers || {}),
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const errorData = await res.json();
      const errorMessage = errorData.message || 'Failed to update listing';
      throw new Error(errorMessage);
    }
    return await res.json();
  } catch (err) {
    console.error('[ListingService] updateListing error:', err);
    throw err;
  }
}

// Delete listing by ID
export async function deleteListing(id, options = {}) {
  try {
    const token = await getAdminAuthToken();
    const res = await fetch(`${LISTINGS_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        ...(options.headers || {}),
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const errorData = await res.json();
      const errorMessage = errorData.message || 'Failed to delete listing';
      throw new Error(errorMessage);
    }
    return await res.json();
  } catch (err) {
    console.error('[ListingService] deleteListing error:', err);
    throw err;
  }
}

// Get inactive listings
export async function getInactiveListings() {
  const res = await fetch(`${LISTINGS_URL}/all/inactive`);
  if (!res.ok) throw new Error("Failed to fetch inactive listings");
  return res.json();
}

// Get all active listings
export async function getAllActiveListings() {
  const res = await fetch(`${LISTINGS_URL}/all/active`);
  if (!res.ok) throw new Error("Failed to fetch active listings");
  return res.json();
}

// Activate a single listing
export async function activateListing(id, apiKey) {
  const token = await getAdminAuthToken();
  const res = await fetch(`${LISTINGS_URL}/activate/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-api-token": apiKey,
      "Authorization": `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to activate listing");
  return res.json();
}

// Bulk activate listings
export async function bulkActivateListings(payload, apiKey) {
  const token = await getAdminAuthToken();
  const res = await fetch(`${LISTINGS_URL}/bulk-activate`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-api-token": apiKey,
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to bulk activate listings");
  return res.json();
}

// Inactivate listings (bulk)
export async function inactivateListings(payload, apiKey) {
  const token = await getAdminAuthToken();
  const res = await fetch(`${LISTINGS_URL}/inactivate`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-api-token": apiKey,
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to inactivate listings");
  return res.json();
}

// Get active listings for a provider
export async function getListingsByProviderId(providerId) {
  // Assuming providerId mapping can be achieved by passing query param
  const res = await fetch(`${LISTINGS_URL}?providerId=${providerId}`);
  if (!res.ok) throw new Error("Failed to get listings by provider id");
  return await res.json();
}

// Get all listings
export async function getAllListings() {
  const res = await fetch(LISTINGS_URL);
  if (!res.ok) throw new Error("Failed to fetch all listings");
  return await res.json();
}

export default {
  uploadListing,
  updateListing,
  deleteListing,
  getInactiveListings,
  getAllActiveListings,
  getListingsByProviderId,
  getAllListings,
  activateListing,
  bulkActivateListings,
  inactivateListings,
};
