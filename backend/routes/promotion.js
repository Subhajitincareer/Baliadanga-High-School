import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { checkEligibility, promoteStudent } from '../controllers/promotionController.js';

const router = express.Router();

router.get('/check/:studentId', protect, checkEligibility);
router.post('/promote', protect, authorize('admin'), promoteStudent);

export default router;
