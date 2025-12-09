import express from 'express';
import { checkWhitelist, getStudents, updateUserPermissions } from '../controllers/adminController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/whitelist/:email', checkWhitelist);
router.get('/students', protect, getStudents); // Allow admins/teachers
router.put('/permissions/:userId', protect, authorize('admin'), updateUserPermissions);

export default router;
