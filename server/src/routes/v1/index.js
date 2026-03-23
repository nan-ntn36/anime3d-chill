/**
 * API v1 Router
 * Aggregate tất cả route modules
 */

const { Router } = require('express');
const authRoutes = require('./authRoutes');
const movieRoutes = require('./movieRoutes');

const router = Router();

// ── Auth ────────────────────────────────────────────────────
router.use('/auth', authRoutes);

// ── Movies ──────────────────────────────────────────────────
router.use('/movies', movieRoutes);

// ── Future routes ───────────────────────────────────────────
// router.use('/me', meRoutes);            // Ngày 13
// router.use('/admin', adminRoutes);      // Ngày 15

module.exports = router;

