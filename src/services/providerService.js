import { PROVIDERS_URL } from '../config/apiConfig';
import { getAuthToken } from '../auth/firebaseClient';

async function getAdminAuthToken() {
  const token = await getAuthToken();
  if (!token) throw new Error("Authentication required");
  return token;
}

/** Get all providers */
export async function getAllProviders() {
  const res = await fetch(PROVIDERS_URL);
  if (!res.ok) throw new Error("Failed to fetch providers");
  return res.json();
}

/** Get providers for owner (filtered server-side by auth) */
export async function getProvidersByOwner() {
  const token = await getAdminAuthToken();
  const res = await fetch(`${PROVIDERS_URL}/mine`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to fetch owner providers");
  return res.json();
}

/** Create a new provider (multipart: logo + banner) */
export async function createProvider(formData, options = {}) {
  const token = await getAdminAuthToken();
  const res = await fetch(PROVIDERS_URL, {
    method: 'POST',
    body: formData,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to create provider');
  }
  return res.json();
}

/** Update an existing provider */
export async function updateProvider(id, formData, options = {}) {
  const token = await getAdminAuthToken();
  const res = await fetch(`${PROVIDERS_URL}/${id}`, {
    method: 'PUT',
    body: formData,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to update provider');
  }
  return res.json();
}

/** Delete a provider */
export async function deleteProvider(id, options = {}) {
  const token = await getAdminAuthToken();
  const res = await fetch(`${PROVIDERS_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to delete provider');
  return res.json();
}
