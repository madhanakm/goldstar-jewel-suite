export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://jewelapi.sricashway.com',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/local',
      REGISTER: '/api/auth/local/register',
      FORGOT_PASSWORD: '/api/auth/forgot-password',
      RESET_PASSWORD: '/api/auth/reset-password'
    },
    LOGIN_DETAILS: '/api/logindetails',
    PRODUCTS: '/api/products',
    CUSTOMERS: '/api/customers'
  }
};