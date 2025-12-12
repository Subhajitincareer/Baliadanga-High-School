import Admission from '../models/Admission.js';
import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
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
    const { status, rollNumber, remarks } = req.body;

    // Create update object with only defined fields
    const updateFields = {};
    if (status) updateFields.status = status;
    if (rollNumber) updateFields.rollNumber = rollNumber;
    if (remarks) updateFields.remarks = remarks;

    const admission = await Admission.findByIdAndUpdate(
        req.params.id,
        updateFields,
        { new: true, runValidators: true }
    );

    if (!admission) {
        res.status(404);
        throw new Error('Admission not found');
    }

    // Auto-Create Student Account if Approved
    if (status === 'Approved') {
        // Check if user already exists
        const existingUser = await User.findOne({ email: admission.email });

        if (!existingUser) {
            // Generate Student ID (e.g. ST-2024-001)
            const count = await User.countDocuments({ role: 'student' });
            const studentId = `ST-${new Date().getFullYear()}-${(count + 1).toString().padStart(3, '0')}`;

            // Create User (Password: DOB in DDMMYYYY format or Phone)
            // Note: Password hashing is handled by User model pre-save hook? YES.
            // Let's use Phone as default password for simplicity
            const password = admission.phoneNumber;

            const newUser = await User.create({
                name: admission.studentName,
                email: admission.email || `${studentId.toLowerCase()}@school.local`,
                password: password,
                role: 'student',
                permissions: ['student.access']
            });

            // Create Student Profile
            await StudentProfile.create({
                user: newUser._id,
                studentId: studentId,
                rollNumber: admission.rollNumber || 'TBD',
                class: admission.class,
                section: 'A', // Default
                admissionNo: admission._id.toString(), // Link to admission
                admissionDate: new Date(),
                // Copy other fields
                fullName: admission.studentName,
                dateOfBirth: admission.dateOfBirth,
                gender: admission.gender,
                bloodGroup: 'Unknown',
                contactNumber: admission.phoneNumber,
                email: admission.email,
                address: admission.address,
                guardianName: admission.guardianName,
                guardianPhone: admission.guardianPhone,
                photoUrl: admission.photoUrl
            });

            // Ideally we should send an email here with credentials
            console.log(`Auto-created student account: ${newUser.email} / ${password}`);
        }
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
