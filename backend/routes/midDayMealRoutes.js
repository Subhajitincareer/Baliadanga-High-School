import express from 'express';
import { markDailyMeal, getMealReport, getMonthlySummary, getDailySummary, saveClassCount } from '../controllers/midDayMealController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ─── Public route (no login required) ───────────────────────────────────────
router.get('/daily-summary', getDailySummary);

// ─── Protected routes ────────────────────────────────────────────────────────
router.use(protect);
router.use(authorize('admin', 'teacher', 'staff', 'principal', 'vice_principal'));

router.route('/')
    .post(markDailyMeal)
    .get(getMealReport);

router.get('/monthly-summary', getMonthlySummary);
router.post('/count', saveClassCount); // teacher quick count-entry

export default router;
