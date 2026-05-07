// import axios from 'axios';

// /**
//  * API Configuration
//  * 
//  * Change this URL to point to your Express backend:
//  * - Development: http://localhost:3001 (or whatever port your Express server runs on)
//  * - Production: https://your-api-domain.com
//  * 
//  * You can set VITE_API_URL in a .env file:
//  * VITE_API_URL=http://localhost:3001
//  */
// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// // Create axios instance with default config
// const api = axios.create({
//   baseURL: `${API_URL}/api`,
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   withCredentials: true, // Include cookies in requests (useful for sessions)
// });

// /**
//  * Request interceptor
//  * Automatically adds the auth token to every request
//  */
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// /**
//  * Response interceptor
//  * Handles 401 (Unauthorized) errors by clearing auth and redirecting to login
//  */
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       // Clear auth data on unauthorized
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//       // Redirect to login if not already there
//       if (window.location.pathname !== '/' && window.location.pathname !== '/login') {
//         window.location.href = '/login';
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;


////////////////////
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
// const API_URL = 'http://localhost:3000';
// const API_URL = '/api';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // REQUIRED: sends HttpOnly cookies with every request
});
// const api = axios.create({
//   baseURL: API_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   withCredentials: true, // REQUIRED: sends HttpOnly cookies with every request
// });

/**
 * Request interceptor
 * REMOVED: No localStorage token — HttpOnly cookie is sent automatically by browser
 */
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

/**
 * Response interceptor
 * Handles 401 by clearing frontend auth state and redirecting to login
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Dispatch a custom event so AuthContext can react and clear user state
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));

      // Redirect to login if not already there
      const publicPaths = ['/', '/login', '/register', '/auth/callback'];
      if (!publicPaths.includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;