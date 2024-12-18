export const config = {
  API_URL: process.env.VITE_API_URL,
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  CACHE_MAX_SIZE: 100,
  AUTH_TOKEN_KEY: 'token',
  REFRESH_TOKEN_KEY: 'refreshToken',
  DEFAULT_LANGUAGE: 'en',
  SUPPORTED_LANGUAGES: ['en', 'fr'],
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100
  },
  TIMEOUTS: {
    DEFAULT: 10000, // 10 seconds
    UPLOAD: 30000 // 30 seconds
  },
  RETRY: {
    MAX_RETRIES: 3,
    DELAY: 1000 // 1 second
  }
}; 