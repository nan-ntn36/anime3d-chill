/**
 * Auth Middleware & Validation Integration Tests
 * Tests express-validator rules and auth middleware without mocking CJS modules.
 * Uses a minimal Express app with directly imported validators and middleware.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';

// Import validators and middleware directly (CJS)
const validate = require('../../src/middleware/validate');
const { registerValidation, loginValidation } = require('../../src/validators/authValidators');
const { errorHandler } = require('../../src/middleware/errorHandler');
const { generateAccessToken, verifyAccessToken } = require('../../src/utils/jwt');

// ── Helper: Build minimal test app ──
function buildValidationApp() {
  const app = express();
  app.use(express.json());

  // Register validation endpoint
  app.post('/test/register',
    validate(registerValidation),
    (req, res) => res.json({ ok: true, body: req.body })
  );

  // Login validation endpoint
  app.post('/test/login',
    validate(loginValidation),
    (req, res) => res.json({ ok: true, body: req.body })
  );

  // Auth middleware endpoint (manual, no User.findByPk)
  app.get('/test/protected', (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token' });
      }
      const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token);
      res.json({ ok: true, user: decoded });
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
      }
      return res.status(401).json({ error: 'Invalid token' });
    }
  });

  app.use(errorHandler);
  return app;
}

describe('Auth Validation & Middleware', () => {
  let app;

  beforeAll(() => {
    app = buildValidationApp();
  });

  // ── Register Validation ──

  describe('POST /test/register — validation rules', () => {
    it('passes with valid data', async () => {
      const res = await request(app)
        .post('/test/register')
        .send({ username: 'testuser', email: 'test@example.com', password: 'Pass@123' });
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
    });

    it('rejects missing username', async () => {
      const res = await request(app)
        .post('/test/register')
        .send({ email: 'test@example.com', password: 'Pass@123' });
      expect(res.status).toBe(422);
    });

    it('rejects empty username', async () => {
      const res = await request(app)
        .post('/test/register')
        .send({ username: '', email: 'test@example.com', password: 'Pass@123' });
      expect(res.status).toBe(422);
    });

    it('rejects username with special chars', async () => {
      const res = await request(app)
        .post('/test/register')
        .send({ username: 'test user!', email: 'a@b.com', password: 'Pass@123' });
      expect(res.status).toBe(422);
    });

    it('rejects short username (< 3 chars)', async () => {
      const res = await request(app)
        .post('/test/register')
        .send({ username: 'ab', email: 'a@b.com', password: 'Pass@123' });
      expect(res.status).toBe(422);
    });

    it('rejects invalid email', async () => {
      const res = await request(app)
        .post('/test/register')
        .send({ username: 'testuser', email: 'not-email', password: 'Pass@123' });
      expect(res.status).toBe(422);
    });

    it('rejects missing password', async () => {
      const res = await request(app)
        .post('/test/register')
        .send({ username: 'testuser', email: 'test@example.com' });
      expect(res.status).toBe(422);
    });

    it('rejects short password (< 8 chars)', async () => {
      const res = await request(app)
        .post('/test/register')
        .send({ username: 'testuser', email: 'a@b.com', password: 'Aa@1' });
      expect(res.status).toBe(422);
    });

    it('rejects password without uppercase', async () => {
      const res = await request(app)
        .post('/test/register')
        .send({ username: 'testuser', email: 'a@b.com', password: 'password@1' });
      expect(res.status).toBe(422);
    });

    it('rejects password without number', async () => {
      const res = await request(app)
        .post('/test/register')
        .send({ username: 'testuser', email: 'a@b.com', password: 'Password@' });
      expect(res.status).toBe(422);
    });

    it('rejects password without special char', async () => {
      const res = await request(app)
        .post('/test/register')
        .send({ username: 'testuser', email: 'a@b.com', password: 'Password1' });
      expect(res.status).toBe(422);
    });
  });

  // ── Login Validation ──

  describe('POST /test/login — validation rules', () => {
    it('passes with valid data', async () => {
      const res = await request(app)
        .post('/test/login')
        .send({ email: 'test@example.com', password: 'anypassword' });
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
    });

    it('rejects missing email', async () => {
      const res = await request(app)
        .post('/test/login')
        .send({ password: 'Pass@123' });
      expect(res.status).toBe(422);
    });

    it('rejects invalid email format', async () => {
      const res = await request(app)
        .post('/test/login')
        .send({ email: 'invalid', password: 'Pass@123' });
      expect(res.status).toBe(422);
    });

    it('rejects missing password', async () => {
      const res = await request(app)
        .post('/test/login')
        .send({ email: 'test@example.com' });
      expect(res.status).toBe(422);
    });
  });

  // ── Auth Middleware (JWT verification) ──

  describe('GET /test/protected — JWT Auth middleware', () => {
    it('returns decoded user for valid token', async () => {
      const token = generateAccessToken({
        id: 42, username: 'john', email: 'john@test.com', role: 'user'
      });

      const res = await request(app)
        .get('/test/protected')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.user.id).toBe(42);
      expect(res.body.user.username).toBe('john');
    });

    it('returns 401 without Authorization header', async () => {
      const res = await request(app).get('/test/protected');
      expect(res.status).toBe(401);
    });

    it('returns 401 for malformed Bearer token', async () => {
      const res = await request(app)
        .get('/test/protected')
        .set('Authorization', 'Bearer garbage.token.here');
      expect(res.status).toBe(401);
    });

    it('returns 401 for expired token', async () => {
      const jwt = require('jsonwebtoken');
      const env = require('../../src/config/env');
      const expiredToken = jwt.sign(
        { id: 1, username: 'x', email: 'x@x.com', role: 'user' },
        env.jwt.accessSecret,
        { expiresIn: '0s' }
      );
      await new Promise(r => setTimeout(r, 100));

      const res = await request(app)
        .get('/test/protected')
        .set('Authorization', `Bearer ${expiredToken}`);
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Token expired');
    });
  });
});
