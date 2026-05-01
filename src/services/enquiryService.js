import { ENQUIRY_API_URL } from '../config/apiConfig';
import { getAuthToken } from '../auth/firebaseClient';


// --- NEW MESSAGE SERVICES (Inline for now, ideally move to services/enquiryService.js) ---
export async function getEnquiries(page = 1, limit = 10, apiKey) {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Fetch Messages: missing Auth token');
  }
  
  const response = await fetch(`${ENQUIRY_API_URL}/paginated?page=${page}&limit=${limit}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      'Authorization': `Bearer ${token}`,
      "x-api-token": apiKey || "",
    },
  });
  if (!response.ok) throw new Error("Failed to fetch messages");
  return await response.json();
}

// update enquiry status
export async function updateEnquiryStatus(enquiryId, status, apiKey) {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Update Message: missing Auth token');
  }
  const response = await fetch(`${ENQUIRY_API_URL}/status/${enquiryId}`, {
    method: "PATCH",
    headers:  {
      "Content-Type": "application/json",
      'Authorization': `Bearer ${token}`,
      "x-api-token": apiKey || "",
    },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error("Failed to update enquiry status");
  return await response.json();
} 

//send enquiry message
export async function sendEnquiryMessage(details, userName, email, phone) {
  // if auth token is preent, include it
  const token = await getAuthToken();
  const response = await fetch(`${ENQUIRY_API_URL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ details, userName, email, phone }),
  });
  if (!response.ok) throw new Error("Failed to send enquiry message");
  return await response.json();
} 
//add a function to send account creation email
export async function sendAccountCreationEmail(enquiryId, tempPassword) {
  const token = await getAuthToken();
  const response = await fetch(`${ENQUIRY_API_URL}/account-creation/${enquiryId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ tempPassword }),
  });
  if (!response.ok) throw new Error("Failed to send account creation email");
  return await response.json();
} 