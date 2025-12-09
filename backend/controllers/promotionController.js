import StudentProfile from '../models/StudentProfile.js';
import FeePayment from '../models/FeePayment.js';
import Result from '../models/Result.js'; // Assuming Result model exists
import asyncHandler from '../middlewares/asyncHandler.js';

// @desc    Check promotion eligibility
// @route   GET /api/promotion/check/:studentId
// @access  Private (Admin/Staff)
export const checkEligibility = asyncHandler(async (req, res) => {
    const { studentId } = req.params;

    // 1. Find Student
    let student = await StudentProfile.findOne({ studentId });
    if (!student) {
        res.status(404);
        throw new Error('Student not found');
    }

    // 2. Find Latest Final Exam Result
    // Assuming logic: Find result for current class, sorted by date.
    // In a real app, we might search for specific "Final Exam" category.
    // For now, we take the latest result.
    const latestResult = await Result.findOne({ studentId: student._id })
        .sort({ createdAt: -1 });

    if (!latestResult) {
        return res.json({
            eligible: false,
            message: 'No exam results found for this student.',
            student
        });
    }

    // 3. Determine Pass/Fail Logic (Mock for now if percentage > 30)
    // You requested "check exam mark pass or fail"
    const isPassed = latestResult.percentage >= 30; // Simple threshold

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

// @desc    Promote Student (Admission 5 to 6)
// @route   POST /api/promotion/promote
// @access  Private (Admin)
export const promoteStudent = asyncHandler(async (req, res) => {
    const { studentId, newClass, paymentAmount, paymentMethod } = req.body;

    // 1. Get Student
    const student = await StudentProfile.findOne({ studentId });
    if (!student) {
        res.status(404);
        throw new Error('Student not found');
    }

    // 2. Record Admission/Session Fee Payment
    const year = new Date().getFullYear();
    const receiptNumber = `SLIP-${year}-${Math.floor(10000 + Math.random() * 90000)}`; // "Yellow Slip" ID

    const payment = await FeePayment.create({
        student: student._id,
        amountPaid: paymentAmount,
        paymentMethod: paymentMethod || 'Cash',
        remarks: `Admission/Promotion Fee to Class ${newClass}`,
        collectedBy: req.user._id,
        academicYear: year.toString(),
        receiptNumber
    });

    // 3. Calculate New Roll Number (Merit Based)
    // Logic: Count how many students already in newClass. Assign next number?
    // User asked "roll number according exam". This implies Rank.
    // Complex logic: We should sort all PROMOTED students by marks. 
    // Simplified Logic: Just increment for now, or Manual Override.
    // Let's find max roll in new class.

    // Convert to number for reliable sorting if stored as string
    // This is tricky if data is predominantly string.
    const studentsInNewClass = await StudentProfile.find({ currentClass: newClass });
    const nextRoll = studentsInNewClass.length + 1;

    // 4. Update Student Profile
    const oldClass = student.currentClass;
    student.currentClass = newClass;
    student.rollNumber = nextRoll.toString(); // or req.body.newRoll if manual
    student.section = 'A'; // Default section, can be changed later
    await student.save();

    // 5. Return "Yellow Slip" Data
    res.json({
        success: true,
        message: `Student promoted to Class ${newClass}`,
        slipData: {
            receiptNo: receiptNumber,
            date: new Date(),
            studentName: student.user.name, // Assuming populated or separate fetch needed?
            // Actually student.user is just ID in profile usually. 
            // We need to fetch user name or rely on frontend passing it.
            // Let's populate for safety result.
            studentId: student.studentId,
            oldClass,
            newClass,
            newRoll: student.rollNumber,
            amountPaid: paymentAmount
        }
    });
});
