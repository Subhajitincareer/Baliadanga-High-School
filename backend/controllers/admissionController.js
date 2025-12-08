import Admission from '../models/Admission.js';
import asyncHandler from '../middlewares/asyncHandler.js';

// @desc    Get all admissions
// @route   GET /api/admissions
// @access  Private (Admin)
export const getAdmissions = asyncHandler(async (req, res, next) => {
    const admissions = await Admission.find().sort({ createdAt: -1 });
    res.status(200).json(admissions);
});

// @desc    Create new admission
// @route   POST /api/admissions
// @access  Public
export const createAdmission = asyncHandler(async (req, res, next) => {
    const admission = await Admission.create(req.body);
    res.status(201).json(admission);
});

// @desc    Update admission status
// @route   PATCH /api/admissions/:id
// @access  Private (Admin)
export const updateAdmissionStatus = asyncHandler(async (req, res, next) => {
    const admission = await Admission.findByIdAndUpdate(
        req.params.id,
        { status: req.body.status },
        { new: true, runValidators: true }
    );

    if (!admission) {
        res.status(404);
        throw new Error('Admission not found');
    }

    res.status(200).json(admission);
});

// @desc    Delete admission
// @route   DELETE /api/admissions/:id
// @access  Private (Admin)
export const deleteAdmission = asyncHandler(async (req, res, next) => {
    const admission = await Admission.findById(req.params.id);

    if (!admission) {
        res.status(404);
        throw new Error('Admission not found');
    }

    await admission.deleteOne();

    res.status(200).json({ success: true, message: 'Admission deleted' });
});
