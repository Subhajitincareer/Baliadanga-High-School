import FeeStructure from '../models/FeeStructure.js';
import FeePayment from '../models/FeePayment.js';
import StudentProfile from '../models/StudentProfile.js';
import asyncHandler from '../middlewares/asyncHandler.js';

// @desc    Create a new fee structure (e.g. "Class X Exam Fee")
// @route   POST /api/fees/structure
// @access  Private (Admin)
export const createFeeStructure = asyncHandler(async (req, res) => {
    const { name, currentClass, amount, type, frequency, description } = req.body;

    // Check duplication
    const year = new Date().getFullYear().toString();
    const exists = await FeeStructure.findOne({ name, currentClass, academicYear: year });

    if (exists) {
        res.status(400);
        throw new Error('This fee structure already exists for the current year');
    }

    const structure = await FeeStructure.create({
        name,
        currentClass,
        amount,
        type,
        frequency,
        academicYear: year,
        description
    });

    res.status(201).json(structure);
});

// @desc    Get all fee structures
// @route   GET /api/fees/structure
// @access  Private (Admin/Staff)
export const getFeeStructures = asyncHandler(async (req, res) => {
    const structures = await FeeStructure.find({}).sort({ academicYear: -1, currentClass: 1 });
    res.json(structures);
});

// @desc    Record a new payment
// @route   POST /api/fees/pay
// @access  Private (Admin/Staff)
export const recordPayment = asyncHandler(async (req, res) => {
    const { studentId, amountPaid, feeStructureId, paymentMethod, remarks } = req.body;

    // Validate Student
    let student;
    if (studentId.match(/^[0-9a-fA-F]{24}$/)) {
        student = await StudentProfile.findById(studentId);
    } else {
        student = await StudentProfile.findOne({ studentId });
    }

    if (!student) {
        res.status(404);
        throw new Error('Student not found');
    }

    // Generate Receipt Number: REC-{Year}-{Random4}
    const year = new Date().getFullYear();
    const receiptNumber = `REC-${year}-${Math.floor(1000 + Math.random() * 9000)}`;

    const payment = await FeePayment.create({
        student: student._id,
        feeStructure: feeStructureId || null,
        amountPaid,
        paymentMethod: paymentMethod || 'Cash',
        remarks,
        collectedBy: req.user._id,
        academicYear: year.toString(),
        receiptNumber
    });

    res.status(201).json(payment);
});

// @desc    Get payments for a student
// @route   GET /api/fees/student/:id
// @access  Private (Admin/Staff/Self)
export const getStudentPayments = asyncHandler(async (req, res) => {
    // Resolve student ID
    let student;
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        student = await StudentProfile.findById(req.params.id);
    } else {
        student = await StudentProfile.findOne({ studentId: req.params.id });
    }

    if (!student) {
        res.status(404);
        throw new Error('Student not found');
    }

    const payments = await FeePayment.find({ student: student._id })
        .populate('feeStructure', 'name amount')
        .populate('collectedBy', 'name')
        .sort({ createdAt: -1 });

    res.json(payments);
});

// @desc    Get Dues Overview (Simple)
// @route   GET /api/fees/dues/:studentId
// @access  Private
export const getStudentDues = asyncHandler(async (req, res) => {
    // 1. Get Student
    let student = await StudentProfile.findOne({ studentId: req.params.studentId });
    if (!student) {
        res.status(404);
        throw new Error('Student not found');
    }

    const currentYear = new Date().getFullYear().toString();

    // 2. Get All Applicable Fees for their Class + 'ALL'
    // Logic: Matches their class, year, and (optionally) specific to them?
    // For simplicity: All structures for their class this year.
    const structures = await FeeStructure.find({
        academicYear: currentYear,
        $or: [{ currentClass: student.currentClass }, { currentClass: 'ALL' }]
    });

    // 3. Get Total Paid This Year
    const payments = await FeePayment.find({
        student: student._id,
        academicYear: currentYear
    });

    const totalFees = structures.reduce((sum, item) => sum + item.amount, 0);
    const totalPaid = payments.reduce((sum, item) => sum + item.amountPaid, 0);

    // Basic breakdown provided
    const dues = {
        student: student.name,
        roll: student.rollNumber,
        totalFees,
        totalPaid,
        balance: totalFees - totalPaid,
        details: structures
    };

    res.json(dues);
});
