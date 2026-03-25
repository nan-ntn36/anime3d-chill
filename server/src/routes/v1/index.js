/**
 * API v1 Router
 * Aggregate tất cả route modules
 */

const express = require('express');
const authRoutes = require('./authRoutes');
const movieRoutes = require('./movieRoutes');
const meRoutes = require('./meRoutes');

const router = express.Router();

// Mount các router con
router.use('/auth', authRoutes);
router.use('/movies', movieRoutes);
router.use('/me', meRoutes);

// ── Future routes ───────────────────────────────────────────
// router.use('/admin', adminRoutes);      // Ngày 15

module.exports = router;

