import express from 'express';
import { markDailyMeal, getMealReport } from '../controllers/midDayMealController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect); // All routes protected
router.use(authorize('admin', 'teacher', 'staff', 'principal', 'vice_principal')); // Allowed roles

router.route('/')
    .post(markDailyMeal)
    .get(getMealReport);

export default router;
