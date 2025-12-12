import express from 'express';
import { register, login, getMe, adminLogin, updatePassword, seedAdmin } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/admin-login', adminLogin);
router.get('/me', protect, getMe);
router.put('/updatepassword', protect, updatePassword);
router.post('/seed-admin', seedAdmin);

export default router;