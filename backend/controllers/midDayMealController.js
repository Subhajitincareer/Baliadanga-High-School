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

// @desc    Monthly Meal Summary (aggregated by class)
// @route   GET /api/mid-day-meal/monthly-summary?month=2025-02
// @access  Private
export const getMonthlySummary = asyncHandler(async (req, res) => {
    const { month } = req.query;

    let startDate, endDate;

    if (month) {
        // month format: "YYYY-MM"
        const [year, m] = month.split('-').map(Number);
        startDate = new Date(year, m - 1, 1);
        endDate = new Date(year, m, 1); // start of next month
    } else {
        // Default: current month
        const now = new Date();
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }

    const summary = await MidDayMeal.aggregate([
        {
            $match: {
                date: { $gte: startDate, $lt: endDate }
            }
        },
        {
            $group: {
                _id: { class: '$class', section: '$section' },
                totalMeals: { $sum: '$totalCount' },
                mealDays: { $sum: 1 },
                avgPerDay: { $avg: '$totalCount' }
            }
        },
        {
            $project: {
                _id: 0,
                class: '$_id.class',
                section: '$_id.section',
                totalMeals: 1,
                mealDays: 1,
                avgPerDay: { $round: ['$avgPerDay', 1] }
            }
        },
        { $sort: { class: 1, section: 1 } }
    ]);

    res.status(200).json({
        success: true,
        month: month || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
        data: summary,
        grandTotal: summary.reduce((acc, s) => acc + s.totalMeals, 0)
    });
});

// @desc    Get today's daily meal summary grouped by class (PUBLIC)
// @route   GET /api/mid-day-meal/daily-summary?date=YYYY-MM-DD
// @access  Public
export const getDailySummary = asyncHandler(async (req, res) => {
    const dateStr = req.query.date || new Date().toISOString().split('T')[0];
    const startOfDay = new Date(dateStr);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(dateStr);
    endOfDay.setHours(23, 59, 59, 999);

    const records = await MidDayMeal.find({
        date: { $gte: startOfDay, $lte: endOfDay }
    }).select('class section totalCount menuItem markedBy').sort({ class: 1, section: 1 });

    // Group by class
    const byClass = {};
    for (const r of records) {
        const cls = r.class;
        if (!byClass[cls]) byClass[cls] = { class: cls, sections: [], classTotal: 0 };
        byClass[cls].sections.push({ section: r.section, count: r.totalCount, menu: r.menuItem });
        byClass[cls].classTotal += r.totalCount;
    }

    const grouped = Object.values(byClass).sort((a, b) =>
        parseInt(a.class) - parseInt(b.class)
    );
    const grandTotal = grouped.reduce((s, g) => s + g.classTotal, 0);

    res.json({ success: true, date: dateStr, data: grouped, grandTotal });
});

// @desc    Teacher saves count for a class without individual student IDs
// @route   POST /api/mid-day-meal/count
// @access  Private (Teacher/Admin)
export const saveClassCount = asyncHandler(async (req, res) => {
    const { date, className, section, count, menuItem } = req.body;

    if (!className || count === undefined || count === null) {
        return res.status(400).json({ success: false, message: 'className and count are required' });
    }

    const dateStr = date || new Date().toISOString().split('T')[0];
    const startOfDay = new Date(dateStr);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(dateStr);
    endOfDay.setHours(23, 59, 59, 999);

    const sec = section || 'All';

    const record = await MidDayMeal.findOneAndUpdate(
        { date: { $gte: startOfDay, $lte: endOfDay }, class: className, section: sec },
        {
            date: startOfDay,
            class: className,
            section: sec,
            totalCount: Number(count),
            studentIds: [], // no individual tracking in this quick-entry mode
            markedBy: req.user._id,
            menuItem: menuItem || 'Standard Meal',
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ success: true, data: record });
});
