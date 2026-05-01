// Lightweight service for user-related backend calls
// Usage: import { createUser } from 'src/services/useService'
import { USER_API_URL } from '../config/apiConfig';
import { getAuthToken } from '../auth/firebaseClient'; 
/**
 * Create a user on the backend.
 * @param {{name:string,username:string,email:string,role:string}} user
 * @param {string} token Bearer token
 * @param {{baseUrl?:string}} [opts] optional settings (default baseUrl: http://localhost:5000)
 * @returns {Promise<any>} parsed JSON response
 */
export async function createUser(user={name:'',username:'',email:'',role:''}) {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('createUser: missing Bearer token');
  }

  const url = `${USER_API_URL}/create-user`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role
    })
  });

  if (!response.ok) throw new Error('Failed to create user');
  return response.json();
}

export default { createUser };
