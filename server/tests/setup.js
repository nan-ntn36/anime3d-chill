/**
 * Test Setup — Set environment variables before any test runs
 * This avoids the env.js validation throwing on missing DB vars
 */

// Set minimum required env vars for test mode
process.env.NODE_ENV = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_NAME = 'anime3d_test';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = 'test_password';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-key-for-testing';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-testing';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '30d';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';
process.env.PORT = '5001';
process.env.KKPHIM_API_URL = 'https://phimapi.com';
