/**
 * API v1 Router
 * Aggregate tất cả route modules
 */

const { Router } = require('express');
const authRoutes = require('./authRoutes');

const router = Router();

// ── Auth ────────────────────────────────────────────────────
router.use('/auth', authRoutes);

// ── Future routes ───────────────────────────────────────────
// router.use('/movies', movieRoutes);     // Ngày 6
// router.use('/me', meRoutes);            // Ngày 13
// router.use('/admin', adminRoutes);      // Ngày 15

module.exports = router;
