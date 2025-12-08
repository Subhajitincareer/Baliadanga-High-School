import express from 'express';
import { checkWhitelist, getStudents } from '../controllers/adminController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/whitelist/:email', checkWhitelist);
router.get('/students', protect, getStudents); // Allow admins/teachers

export default router;
