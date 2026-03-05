import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import asyncHandler from '../middlewares/asyncHandler.js';

const normalizeClass = (cls) => {
    const map = {
        '5': 'V', '6': 'VI', '7': 'VII', '8': 'VIII', '9': 'IX', '10': 'X', '11': 'XI', '12': 'XII',
        'V': '5', 'VI': '6', 'VII': '7', 'VIII': '8', 'IX': '9', 'X': '10', 'XI': '11', 'XII': '12'
    };
    return map[cls] || cls;
};

// @desc    Mark Attendance (Single or Bulk)
// @route   POST /api/attendance
// @access  Private (Teacher/Admin)
export const markAttendance = asyncHandler(async (req, res) => {
    const data = Array.isArray(req.body) ? req.body : [req.body];
    if (data.length === 0) {
        res.status(400);
        throw new Error('No attendance data provided');
    }

    const results = { success: 0, failed: 0, errors: [], lastMarkedStudent: null };

    for (const item of data) {
        try {
            let userId = item.student;
            let studentProfile = null;

            if (!userId && item.studentId) {
                studentProfile = await StudentProfile.findOne({ studentId: item.studentId }).populate('user', 'name email');
                if (studentProfile) userId = studentProfile.user._id;
            } else if (userId) {
                studentProfile = await StudentProfile.findOne({ user: userId }).populate('user', 'name email');
            }

            if (!userId) {
                results.failed++;
                results.errors.push(`Student not found for ID: ${item.studentId}`);
                continue;
            }

            const date = new Date(item.date || Date.now());
            date.setHours(0, 0, 0, 0);

            const payload = {
                student: userId,
                studentId: studentProfile?.studentId || item.studentId,
                date: date,
                status: item.status || 'Present',
                method: item.method || 'Manual',
                markedBy: req.user._id,
                class: item.class || studentProfile?.class,
                section: item.section || studentProfile?.section
            };

            await Attendance.findOneAndUpdate(
                { student: userId, date: date },
                payload,
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );

            results.success++;
            if (data.length === 1 && studentProfile) {
                results.lastMarkedStudent = {
                    name: studentProfile.user.name,
                    studentId: studentProfile.studentId,
                    rollNumber: studentProfile.rollNumber,
                    status: payload.status,
                    class: studentProfile.class,
                    section: studentProfile.section
                };
            }
        } catch (error) {
            results.failed++;
            results.errors.push(error.message);
        }
    }

    res.status(200).json({ message: 'Attendance processed', ...results });
});

// @desc    Get Attendance by Class & Date (Complete list including not-marked)
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

    const targetClass = normalizeClass(className);

    // 1. Get all students in this class/section (Search both versions if numeric/roman mismatch)
    const studentQuery = { 
        $or: [
            { class: className },
            { class: targetClass }
        ]
    };
    if (section) studentQuery.section = section;
    const students = await StudentProfile.find(studentQuery).populate('user', 'name email');

    // 2. Get existing attendance for this date/class/section
    const attendanceRecords = await Attendance.find({
        $or: [
            { class: className },
            { class: targetClass }
        ],
        section: section ? section : { $exists: true },
        date: { $gte: queryDate, $lt: nextDay }
    });

    // 3. Map students to records
    const fullAttendanceList = students.map(student => {
        const record = attendanceRecords.find(r => r.student.toString() === student.user._id.toString());
        return {
            studentId: student.studentId,
            userId: student.user._id,
            name: student.user.name,
            rollNumber: student.rollNumber,
            status: record ? record.status : 'N/A', // Default to N/A if not marked
            markedBy: record ? record.markedBy : null,
            date: queryDate
        };
    }).sort((a, b) => (Number(a.rollNumber) || 0) - (Number(b.rollNumber) || 0));

    res.status(200).json(fullAttendanceList);
});

// @desc    Get Single Student Attendance (History)
// @route   GET /api/attendance/student/:id
// @access  Private (Student/Parent/Admin)
export const getStudentAttendance = asyncHandler(async (req, res) => {
    let userId = req.params.id;

    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
        const user = await User.findOne({ studentId: userId });
        if (user) userId = user._id;
    }

    const attendance = await Attendance.find({ student: userId }).sort({ date: -1 });
    res.status(200).json(attendance);
});
