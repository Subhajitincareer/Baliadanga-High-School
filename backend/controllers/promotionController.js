import { randomUUID } from 'crypto';
import StudentProfile from '../models/StudentProfile.js';
import FeePayment from '../models/FeePayment.js';
import Result from '../models/Result.js';
import asyncHandler from '../middlewares/asyncHandler.js';

// @desc    Check promotion eligibility for a single student
// @route   GET /api/promotion/check/:studentId
// @access  Private (Admin/Staff)
export const checkEligibility = asyncHandler(async (req, res) => {
    const { studentId } = req.params;

    const student = await StudentProfile.findOne({ studentId }).populate('user', 'name email');
    if (!student) {
        res.status(404);
        throw new Error('Student not found');
    }

    const latestResult = await Result.findOne({ studentId: student._id }).sort({ createdAt: -1 });

    if (!latestResult) {
        return res.json({
            eligible: false,
            status: 'NO_RESULT',
            message: 'No exam results found for this student.',
            student
        });
    }

    const isPassed = latestResult.percentage >= 30;

    res.json({
        eligible: isPassed,
        status: isPassed ? 'PASSED' : 'FAILED',
        message: isPassed ? 'Eligible for promotion' : 'Student has failed the exam',
        student,
        resultSummary: {
            total: latestResult.totalObtained,
            percentage: latestResult.percentage,
            grade: latestResult.grade
        }
    });
});

// @desc    Get promotion preview for a full class
// @route   GET /api/promotion/preview?class=VI
// @access  Private (Admin)
export const getPromotionPreview = asyncHandler(async (req, res) => {
    const { class: className, section } = req.query;

    if (!className) {
        res.status(400);
        throw new Error('class query param is required');
    }

    const filter = { class: className, status: 'Active' };
    if (section) filter.section = section;

    // Fetch all active students in this class
    const students = await StudentProfile.find(filter).populate('user', 'name email');

    // Attach latest result to each student
    const studentsWithEligibility = await Promise.all(
        students.map(async (student) => {
            const latestResult = await Result.findOne({ studentId: student._id }).sort({ createdAt: -1 });

            const eligible = latestResult ? latestResult.percentage >= 30 : false;
            return {
                studentId: student.studentId,
                name: student.user?.name || 'N/A',
                class: student.class,
                section: student.section,
                session: student.session,
                rollNumber: student.rollNumber,
                eligible,
                percentage: latestResult?.percentage ?? null,
                grade: latestResult?.grade ?? 'N/A',
            };
        })
    );

    const eligible = studentsWithEligibility.filter(s => s.eligible);
    const ineligible = studentsWithEligibility.filter(s => !s.eligible);

    res.json({
        success: true,
        total: studentsWithEligibility.length,
        eligible,
        ineligible,
    });
});


// @desc    Promote a single student to a new class
// @route   POST /api/promotion/promote
// @access  Private (Admin)
export const promoteStudent = asyncHandler(async (req, res) => {
    const { studentId, newClass, paymentAmount, paymentMethod, newSession } = req.body;

    const student = await StudentProfile.findOne({ studentId }).populate('user', 'name email');
    if (!student) {
        res.status(404);
        throw new Error('Student not found');
    }

    const year = new Date().getFullYear();
    const receiptNumber = `SLIP-${year}-${randomUUID().slice(0, 8).toUpperCase()}`;

    // Record admission/session fee payment if amount provided
    let payment = null;
    if (paymentAmount && paymentAmount > 0) {
        payment = await FeePayment.create({
            student: student._id,
            amountPaid: paymentAmount,
            paymentMethod: paymentMethod || 'Cash',
            remarks: `Promotion Fee: Class ${student.class} → Class ${newClass}`,
            collectedBy: req.user._id,
            academicYear: year.toString(),
            receiptNumber
        });
    }

    // Archive current class info
    const latestResult = await Result.findOne({ studentId: student._id }).sort({ createdAt: -1 });
    student.previousClasses.push({
        class: student.class,
        section: student.section,
        session: student.session,
        percentage: latestResult?.percentage ?? 0,
        grade: latestResult?.grade ?? 'N/A',
        promotedAt: new Date()
    });

    const oldClass = student.class;

    // Calculate new roll number in new class
    const studentsInNewClass = await StudentProfile.countDocuments({ class: newClass, status: 'Active' });
    const nextRoll = (studentsInNewClass + 1).toString();

    // Update student profile
    student.class = newClass;
    student.currentClass = newClass;
    student.session = newSession || `${year}-${year + 1}`;
    student.rollNumber = nextRoll;
    student.section = 'A'; // Default; admin can reassign later
    await student.save();

    res.json({
        success: true,
        message: `Student promoted to Class ${newClass}`,
        slipData: {
            receiptNo: receiptNumber,
            date: new Date(),
            studentName: student.user?.name || studentId,
            studentId: student.studentId,
            oldClass,
            newClass,
            newRoll: nextRoll,
            amountPaid: paymentAmount || 0
        }
    });
});

// @desc    Bulk promote all students from one class to another
// @route   POST /api/promotion/bulk
// @access  Private (Admin)
export const bulkPromote = asyncHandler(async (req, res) => {
    const { fromClass, toClass, newSession, promoteAll } = req.body;

    if (!fromClass || !toClass) {
        res.status(400);
        throw new Error('fromClass and toClass are required');
    }

    // Find eligible students (or all if promoteAll flag set)
    const students = await StudentProfile.find({
        class: fromClass,
        status: 'Active'
    });

    if (students.length === 0) {
        return res.json({
            success: true,
            message: `No active students found in Class ${fromClass}`,
            promoted: 0,
            held: 0
        });
    }

    const year = new Date().getFullYear();
    const targetSession = newSession || `${year}-${year + 1}`;

    const results = { promoted: 0, held: 0, errors: [] };

    // Find current count in destination class to assign roll numbers
    let rollCounter = await StudentProfile.countDocuments({ class: toClass, status: 'Active' });

    for (const student of students) {
        try {
            // Get latest result
            const latestResult = await Result.findOne({ studentId: student._id }).sort({ createdAt: -1 });
            const isPassed = latestResult ? latestResult.percentage >= 30 : false;

            if (!isPassed && !promoteAll) {
                results.held++;
                continue;
            }

            // Archive current class
            student.previousClasses.push({
                class: student.class,
                section: student.section,
                session: student.session,
                percentage: latestResult?.percentage ?? 0,
                grade: latestResult?.grade ?? 'N/A',
                promotedAt: new Date()
            });

            rollCounter++;
            student.class = toClass;
            student.currentClass = toClass;
            student.session = targetSession;
            student.rollNumber = rollCounter.toString();
            student.section = 'A'; // Will need section assignment later

            await student.save();
            results.promoted++;

        } catch (err) {
            results.errors.push(`${student.studentId}: ${err.message}`);
        }
    }

    res.json({
        success: true,
        message: `Bulk promotion complete: ${results.promoted} promoted, ${results.held} held back.`,
        ...results
    });
});
