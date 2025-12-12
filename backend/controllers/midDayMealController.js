import MidDayMeal from '../models/MidDayMeal.js';
import asyncHandler from '../middlewares/asyncHandler.js';

// @desc    Mark Daily Meal (Upsert)
// @route   POST /api/mid-day-meal
// @access  Private (Teacher/Admin)
export const markDailyMeal = asyncHandler(async (req, res) => {
    const { date, selectedClass, section, studentIds, menuItem } = req.body;

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const mealRecord = await MidDayMeal.findOneAndUpdate(
        {
            date: { $gte: startOfDay, $lte: endOfDay },
            class: selectedClass,
            section: section
        },
        {
            date: startOfDay, // Normalize date
            class: selectedClass,
            section: section,
            studentIds: studentIds,
            totalCount: studentIds.length,
            markedBy: req.user._id,
            menuItem: menuItem || 'Standard Meal'
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json(mealRecord);
});

// @desc    Get Meal Report (By Date or Class)
// @route   GET /api/mid-day-meal
// @access  Private
export const getMealReport = asyncHandler(async (req, res) => {
    const { date, class: selectedClass } = req.query;

    let query = {};

    if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    if (selectedClass) {
        query.class = selectedClass;
    }

    const records = await MidDayMeal.find(query).sort({ class: 1, section: 1 });
    res.status(200).json(records);
});
