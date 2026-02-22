import FeeStructure from '../models/FeeStructure.js';
import FeePayment from '../models/FeePayment.js';
import StudentProfile from '../models/StudentProfile.js';
import asyncHandler from '../middlewares/asyncHandler.js';
import { randomUUID } from 'crypto';

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

    // Generate collision-safe receipt number using crypto.randomUUID()
    // Format: REC-{YEAR}-{8-char UUID hex} e.g. REC-2026-A3F7C21B
    const receiptNumber = `REC-${year}-${randomUUID().slice(0, 8).toUpperCase()}`;

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

// @desc    Get my own fee history (Student-facing)
// @route   GET /api/fees/my-history
// @access  Private (Student)
export const getMyFeeHistory = asyncHandler(async (req, res) => {
    // Resolve logged-in user → StudentProfile
    const profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) {
        res.status(404);
        throw new Error('Student profile not found');
    }

    const currentYear = new Date().getFullYear().toString();

    // All fee structures applicable to this student's class
    const structures = await FeeStructure.find({
        $or: [{ currentClass: profile.currentClass || profile.class }, { currentClass: 'ALL' }]
    }).sort({ amount: -1 });

    // All payments this student has made (all years)
    const payments = await FeePayment.find({ student: profile._id })
        .populate('feeStructure', 'name amount type')
        .populate('collectedBy', 'name')
        .sort({ paymentDate: -1 });

    // Compute current year outstanding
    const thisYearStructures = structures.filter(s => s.academicYear === currentYear || !s.academicYear);
    const thisYearPayments = payments.filter(p => p.academicYear === currentYear);
    const totalDue = thisYearStructures.reduce((sum, s) => sum + s.amount, 0);
    const totalPaid = thisYearPayments.reduce((sum, p) => sum + p.amountPaid, 0);

    res.json({
        success: true,
        data: {
            structures,
            payments,
            summary: {
                totalDue,
                totalPaid,
                outstanding: Math.max(0, totalDue - totalPaid)
            }
        }
    });
});
