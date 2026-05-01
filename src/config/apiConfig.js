// Centralized API/static asset URLs. Update here to change endpoints globally.

const BASE_API = import.meta.env.VITE_BASE_API;
const OFFERS_URL = import.meta.env.VITE_OFFERS_URL;
const RESTAURANTS_URL = import.meta.env.VITE_RESTAURANTS_URL;
const BULK_API_URL = import.meta.env.VITE_BULK_API_URL;
const ENQUIRY_API_URL = import.meta.env.VITE_ENQUIRY_API_URL;
const USER_API_URL = import.meta.env.VITE_USER_API_URL; 
export  {
  OFFERS_URL,
  RESTAURANTS_URL,
  BASE_API,
  BULK_API_URL,
  ENQUIRY_API_URL,
  USER_API_URL
};

/*
export const API_CONFIG = {
  BASE_API: import.meta.env.VITE_BASE_API,
  OFFERS_URL: import.meta.env.VITE_OFFERS_URL,
  RESTAURANTS_URL: import.meta.env.VITE_RESTAURANTS_URL,
  BULK_API_URL: import.meta.env.VITE_BULK_API_URL,
  ENQUIRY_API_URL: import.meta.env.VITE_ENQUIRY_API_URL,
};
*/
// then reference like:
// import { API_CONFIG } from '../config/apiConfig';
// const res = await fetch(`${API_CONFIG.OFFERS_URL}`);



