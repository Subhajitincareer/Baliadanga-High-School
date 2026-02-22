import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { getDashboardSummary } from '../controllers/analyticsController.js';

const router = express.Router();

router.get(
    '/dashboard-summary',
    protect,
    authorize('admin', 'principal', 'vice_principal'),
    getDashboardSummary
);

export default router;
