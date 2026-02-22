import express from 'express';
import { markDailyMeal, getMealReport, getMonthlySummary } from '../controllers/midDayMealController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'teacher', 'staff', 'principal', 'vice_principal'));

router.route('/')
    .post(markDailyMeal)
    .get(getMealReport);

router.get('/monthly-summary', getMonthlySummary);

export default router;

