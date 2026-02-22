import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import {
    checkEligibility,
    promoteStudent,
    bulkPromote,
    getPromotionPreview
} from '../controllers/promotionController.js';

const router = express.Router();

router.get('/check/:studentId', protect, checkEligibility);
router.get('/preview', protect, authorize('admin'), getPromotionPreview);
router.post('/promote', protect, authorize('admin'), promoteStudent);
router.post('/bulk', protect, authorize('admin'), bulkPromote);

export default router;
