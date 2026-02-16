// API module that switches between real and mock implementations
// Set VITE_USE_MOCK_API=true in .env for mock mode (Netlify demo)
// Leave unset or false for real PHP backend (local dev / production)

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true';

// Re-export everything from the appropriate implementation
export * from './api-real';

// Import both implementations
import * as realApi from './api-real';
import * as mockApi from './api-mock';

// Select implementation based on environment
const api = USE_MOCK ? mockApi : realApi;

// Export functions that use the selected implementation
export const setToken = api.setToken;
export const clearToken = api.clearToken;
export const isLoggedIn = api.isLoggedIn;
export const login = api.login;
export const getMitarbeiter = api.getMitarbeiter;
export const getFilialen = api.getFilialen;
export const submitHours = api.submitHours;
export const getHoursHistory = api.getHoursHistory;
export const logout = api.logout;
