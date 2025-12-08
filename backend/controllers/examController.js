import Exam from '../models/Exam.js';
import asyncHandler from '../middlewares/asyncHandler.js';

// @desc    Get all exams
// @route   GET /api/exams
// @access  Public (or Protected based on need)
export const getExams = asyncHandler(async (req, res) => {
    // Optional filter by class or session
    const { session, class: grade } = req.query;
    let query = {};
    if (session) query.session = session;
    if (grade) query.class = grade;

    const exams = await Exam.find(query).sort({ createdAt: -1 });

    res.json({
        success: true,
        count: exams.length,
        data: exams
    });
});

// @desc    Get single exam
// @route   GET /api/exams/:id
// @access  Public
export const getExamById = asyncHandler(async (req, res) => {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
        res.status(404);
        throw new Error('Exam not found');
    }

    res.json({
        success: true,
        data: exam
    });
});

// @desc    Create new exam
// @route   POST /api/exams
// @access  Private (Admin)
export const createExam = asyncHandler(async (req, res) => {
    const exam = await Exam.create(req.body);

    res.status(201).json({
        success: true,
        data: exam
    });
});

// @desc    Update exam
// @route   PUT /api/exams/:id
// @access  Private (Admin)
export const updateExam = asyncHandler(async (req, res) => {
    let exam = await Exam.findById(req.params.id);

    if (!exam) {
        res.status(404);
        throw new Error('Exam not found');
    }

    exam = await Exam.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.json({
        success: true,
        data: exam
    });
});

// @desc    Delete exam
// @route   DELETE /api/exams/:id
// @access  Private (Admin)
export const deleteExam = asyncHandler(async (req, res) => {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
        res.status(404);
        throw new Error('Exam not found');
    }

    await exam.deleteOne();

    res.json({
        success: true,
        data: {}
    });
});
