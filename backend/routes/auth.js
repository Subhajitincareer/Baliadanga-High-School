import express from 'express';
import { register, login, getMe, adminLogin, logout, updatePassword, seedAdmin, setupAdmin } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { loginLimiter } from '../middlewares/rateLimiter.js';
import User from '../models/User.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', loginLimiter, login);
router.post('/admin-login', loginLimiter, adminLogin);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/updatepassword', protect, updatePassword);
router.post('/seed-admin', seedAdmin);

// ── First-Run Setup Routes ──────────────────────────────────────────────────
// GET  /api/auth/setup-status  →  { setupRequired: true/false }
// POST /api/auth/setup-admin   →  Creates first admin (locks after one use)
router.get('/setup-status', async (req, res) => {
  const exists = await User.findOne({ role: { $in: ['admin', 'principal'] } });
  res.json({ setupRequired: !exists });
});
router.post('/setup-admin', setupAdmin);

export default router;