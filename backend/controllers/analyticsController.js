import StudentProfile from '../models/StudentProfile.js';
import Staff from '../models/Staff.js';
import Admission from '../models/Admission.js';
import Attendance from '../models/Attendance.js';
import FeePayment from '../models/FeePayment.js';
import Announcement from '../models/Announcement.js';
import asyncHandler from '../middlewares/asyncHandler.js';

// @desc    Get admin dashboard summary stats
// @route   GET /api/analytics/dashboard-summary
// @access  Private (Admin / Principal)
export const getDashboardSummary = asyncHandler(async (req, res) => {
    // Date helpers
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
        totalStudents,
        totalStaff,
        pendingAdmissions,
        todayAttendanceResult,
        thisMonthFees,
        recentAnnouncements
    ] = await Promise.all([
        StudentProfile.countDocuments({ status: 'Active' }),
        Staff.countDocuments({ isActive: true }),
        Admission.countDocuments({ status: 'Pending' }),
        Attendance.aggregate([
            {
                $match: {
                    date: { $gte: today, $lte: todayEnd }
                }
            },
            {
                $project: {
                    presentCount: {
                        $size: {
                            $filter: {
                                input: '$records',
                                as: 'r',
                                cond: { $in: ['$$r.status', ['Present', 'Late']] }
                            }
                        }
                    },
                    totalCount: { $size: '$records' }
                }
            },
            {
                $group: {
                    _id: null,
                    totalPresent: { $sum: '$presentCount' },
                    totalCount: { $sum: '$totalCount' }
                }
            }
        ]),
        FeePayment.aggregate([
            { $match: { paymentDate: { $gte: firstOfMonth } } },
            { $group: { _id: null, total: { $sum: '$amountPaid' } } }
        ]),
        Announcement.countDocuments({ createdAt: { $gte: weekAgo } })
    ]);

    const attendanceStats = todayAttendanceResult[0] || { totalPresent: 0, totalCount: 0 };
    const attendancePercent = attendanceStats.totalCount > 0
        ? Math.round((attendanceStats.totalPresent / attendanceStats.totalCount) * 100)
        : 0;

    res.json({
        success: true,
        data: {
            totalStudents,
            totalStaff,
            pendingAdmissions,
            todayAttendancePercent: attendancePercent,
            todayPresentCount: attendanceStats.totalPresent,
            thisMonthFees: thisMonthFees[0]?.total || 0,
            recentAnnouncements
        }
    });
});
