import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import asyncHandler from '../middlewares/asyncHandler.js';

// @desc    Mark Attendance (Single or Bulk)
// @route   POST /api/attendance
// @access  Private (Teacher/Admin)
export const markAttendance = asyncHandler(async (req, res) => {
    // Accepts array of attendance objects OR a single object
    const data = Array.isArray(req.body) ? req.body : [req.body];

    if (data.length === 0) {
        res.status(400);
        throw new Error('No attendance data provided');
    }

    const results = { success: 0, failed: 0, errors: [] };

    for (const item of data) {
        try {
            // Find student user ID if only studentId provided
            let userId = item.student; // Assuming _id sent
            if (!userId && item.studentId) {
                const studentUser = await User.findOne({ studentId: item.studentId });
                if (studentUser) {
                    userId = studentUser._id;
                } else {
                    // Try profile fall back
                    const profile = await StudentProfile.findOne({ studentId: item.studentId });
                    if (profile) userId = profile.user;
                }
            }

            if (!userId) {
                results.failed++;
                results.errors.push(`Student not found for ID: ${item.studentId}`);
                continue;
            }

            const date = new Date(item.date || Date.now());
            date.setHours(0, 0, 0, 0); // Normalize to midnight

            const payload = {
                student: userId,
                studentId: item.studentId, // Keep string ID too
                date: date,
                status: item.status || 'Present',
                method: item.method || 'Manual',
                markedBy: req.user._id,
                class: item.class,
                section: item.section
            };

            // Upsert (Update if exists, Insert if new)
            await Attendance.findOneAndUpdate(
                { student: userId, date: date },
                payload,
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            results.success++;

        } catch (error) {
            results.failed++;
            results.errors.push(error.message);
        }
    }

    res.status(200).json({ message: 'Attendance processed', results });
});

// @desc    Get Attendance by Class & Date
// @route   GET /api/attendance/class
// @access  Private (Teacher/Admin)
export const getClassAttendance = asyncHandler(async (req, res) => {
    const { className, section, date } = req.query;

    if (!className || !date) {
        res.status(400);
        throw new Error('Class and Date are required');
    }

    const queryDate = new Date(date);
    queryDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(queryDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const attendance = await Attendance.find({
        class: className,
        section: section ? section : { $exists: true }, // Optional section
        date: { $gte: queryDate, $lt: nextDay }
    }).populate('student', 'name email studentId rollNumber');

    res.status(200).json(attendance);
});

// @desc    Get Single Student Attendance (History)
// @route   GET /api/attendance/student/:id
// @access  Private (Student/Parent/Admin)
export const getStudentAttendance = asyncHandler(async (req, res) => {
    // id can be UserId or StudentId string
    let userId = req.params.id;

    // Logic to resolve userId if string ID passed (omitted for brevity, assuming _id usually from frontend)
    // Actually simpler to just search by student or studentId field in Model? 
    // But Model stores Object ID ref.

    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
        const user = await User.findOne({ studentId: userId });
        if (user) userId = user._id;
    }

    const attendance = await Attendance.find({ student: userId }).sort({ date: -1 });
    res.status(200).json(attendance);
});
