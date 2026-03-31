/**
 * JWT Utility Tests
 * Test: generate, verify, expired, invalid tokens
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Must require AFTER setup.js sets env vars
const { generateAccessToken, verifyAccessToken, generateRefreshToken, getRefreshTokenExpiry } = require('../../src/utils/jwt');

describe('JWT Utilities', () => {
  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    role: 'user',
  };

  describe('generateAccessToken', () => {
    it('should return a non-empty string', () => {
      const token = generateAccessToken(mockUser);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should encode user data in payload', () => {
      const token = generateAccessToken(mockUser);
      const decoded = verifyAccessToken(token);

      expect(decoded.id).toBe(mockUser.id);
      expect(decoded.username).toBe(mockUser.username);
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.role).toBe(mockUser.role);
    });

    it('should include iat and exp claims', () => {
      const token = generateAccessToken(mockUser);
      const decoded = verifyAccessToken(token);

      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify a valid token', () => {
      const token = generateAccessToken(mockUser);
      const decoded = verifyAccessToken(token);

      expect(decoded.id).toBe(1);
    });

    it('should throw for an invalid token', () => {
      expect(() => verifyAccessToken('invalid.token.here')).toThrow();
    });

    it('should throw for a tampered token', () => {
      const token = generateAccessToken(mockUser);
      const tampered = token.slice(0, -5) + 'xxxxx'; // corrupt signature
      expect(() => verifyAccessToken(tampered)).toThrow();
    });

    it('should throw for an expired token', async () => {
      // Mock env to create a token that expires immediately
      const jwt = require('jsonwebtoken');
      const env = require('../../src/config/env');

      const expiredToken = jwt.sign(
        { id: 1, username: 'test', email: 'test@test.com', role: 'user' },
        env.jwt.accessSecret,
        { expiresIn: '0s' }
      );

      // Wait a moment for it to expire
      await new Promise((r) => setTimeout(r, 100));

      expect(() => verifyAccessToken(expiredToken)).toThrow();
    });
  });

  describe('generateRefreshToken', () => {
    it('should return a UUID string', () => {
      const token = generateRefreshToken();
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      expect(token).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('should generate unique tokens', () => {
      const token1 = generateRefreshToken();
      const token2 = generateRefreshToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('getRefreshTokenExpiry', () => {
    it('should return a Date object in the future', () => {
      const expiry = getRefreshTokenExpiry();
      expect(expiry).toBeInstanceOf(Date);
      expect(expiry.getTime()).toBeGreaterThan(Date.now());
    });

    it('should return ~30 days from now by default', () => {
      const expiry = getRefreshTokenExpiry();
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      const diff = expiry.getTime() - Date.now();
      // Should be within 1 second of 30 days
      expect(diff).toBeGreaterThan(thirtyDaysMs - 1000);
      expect(diff).toBeLessThan(thirtyDaysMs + 1000);
    });
  });
});
