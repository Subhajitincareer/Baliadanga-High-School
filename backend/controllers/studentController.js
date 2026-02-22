import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import asyncHandler from '../middlewares/asyncHandler.js';

// @desc    Get all students (with profile)
// @route   GET /api/students
// @access  Private (Admin/Staff)
export const getStudents = asyncHandler(async (req, res, next) => {
    // Populate user to get name/email
    const students = await StudentProfile.find({})
        .populate('user', 'name email')
        .sort({ 'class': 1, 'rollNumber': 1 });
    res.status(200).json(students);
});

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private (Admin/Staff/Self)
export const getStudent = asyncHandler(async (req, res, next) => {
    // Try finding by studentId string first (e.g. ST-2025-...)
    let student = await StudentProfile.findOne({ studentId: req.params.id }).populate('user', 'name email');

    // If not found, try by User ObjectId
    if (!student) {
        // Validation for ObjectId
        if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            student = await StudentProfile.findOne({ user: req.params.id }).populate('user', 'name email');
        }
    }

    if (!student) {
        res.status(404);
        throw new Error('Student profile not found');
    }

    res.status(200).json(student);
});

// @desc    Create/Register a new Student (Individual)
// @route   POST /api/students
// @access  Private (Admin)
export const createStudent = asyncHandler(async (req, res, next) => {
    const {
        name, email, password, // User fields
        studentId, rollNumber, class: currentClass, section, guardianName, guardianPhone, address, dob, gender // Profile fields
    } = req.body;

    // 1. Create User
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User with this email already exists');
    }

    // Auto-generate ID if missing
    let finalStudentId = studentId;
    if (!finalStudentId) {
        const year = new Date().getFullYear();
        finalStudentId = `ST-${year}-${currentClass}-${section}-${rollNumber}`;
    }

    const user = await User.create({
        name,
        email,
        password,
        role: 'student',
        studentId: finalStudentId // Save ID to User model for login
    });

    if (user) {
        // ID already generated above


        // 2. Create Profile
        const profile = await StudentProfile.create({
            user: user._id,
            studentId: finalStudentId,
            rollNumber,
            class: currentClass, // 'class' is reserved keyword mapping
            section,
            guardianName,
            guardianPhone,
            address,
            dateOfBirth: dob,
            gender
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profile: profile
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Bulk Import Students
// @route   POST /api/students/bulk
// @access  Private (Admin)
export const bulkImportStudents = asyncHandler(async (req, res, next) => {
    // Expects strict JSON array of student objects
    const studentsData = req.body; // Array of { name, email, studentId, ... }

    if (!Array.isArray(studentsData) || studentsData.length === 0) {
        res.status(400);
        throw new Error('Please provide an array of students');
    }

    const results = {
        successCount: 0,
        errors: []
    };

    for (const student of studentsData) {
        // Default password if not provided
        const password = student.password || `Student@${new Date().getFullYear()}`;

        try {
            // Check if user exists
            let user = await User.findOne({ email: student.email });

            if (user) {
                results.errors.push({ email: student.email, message: 'User already exists' });
                continue;
            }

            // Auto-generate Student ID if not provided
            let finalStudentId = student.studentId;
            if (!finalStudentId || finalStudentId.trim() === '') {
                const year = new Date().getFullYear();
                finalStudentId = `ST-${year}-${student.class}-${student.section}-${student.rollNumber}`;
            }

            // Create User with studentId
            user = await User.create({
                name: student.name,
                email: student.email,
                password: password,
                role: 'student',
                studentId: finalStudentId
            });

            // Auto-generate Student ID if not provided
            // ID already generated above


            // Check if profile exists (unlikely if user is new, but safety check)
            const profileExists = await StudentProfile.findOne({ studentId: finalStudentId });
            if (profileExists) {
                results.errors.push({ email: student.email, message: `Student ID ${finalStudentId} already taken` });
                // Clean up user? For now leave user without profile or manual fix needed.
                continue;
            }

            // Create Profile
            await StudentProfile.create({
                user: user._id,
                studentId: finalStudentId,
                rollNumber: student.rollNumber,
                class: student.class,
                section: student.section,
                guardianName: student.guardianName || 'N/A',
                guardianPhone: student.guardianPhone || 'N/A',
                address: student.address,
                dateOfBirth: student.dateOfBirth,
                gender: student.gender
            });

            results.successCount++;

        } catch (error) {
            results.errors.push({ email: student.email, message: error.message });
        }
    }

    res.status(201).json({
        message: `Processed ${studentsData.length} records`,
        results
    });
});

export const deleteStudent = asyncHandler(async (req, res, next) => {
    // Determine if id is studentId or mongoId
    let student;
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        student = await StudentProfile.findById(req.params.id);
    } else {
        student = await StudentProfile.findOne({ studentId: req.params.id });
    }

    if (student) {
        const user = await User.findById(student.user);
        if (user) await user.deleteOne();
        await student.deleteOne();
        res.json({ message: 'Student removed' });
    } else {
        res.status(404);
    }
});

// @desc    Get students filtered by class and section (lightweight)
// @route   GET /api/students/by-class?class=VI&section=A
// @access  Private (Admin/Staff/Teacher)
export const getStudentsByClass = asyncHandler(async (req, res) => {
    const { class: className, section } = req.query;

    if (!className) {
        res.status(400);
        throw new Error('class query parameter is required');
    }

    const query = { class: className, status: 'Active' };
    if (section) query.section = section;

    const students = await StudentProfile.find(query)
        .populate('user', 'name email')
        .sort({ rollNumber: 1 });

    const formatted = students.map(s => ({
        _id: s._id,
        userId: s.user?._id,
        name: s.user?.name || 'N/A',
        email: s.user?.email || '',
        studentId: s.studentId,
        rollNumber: s.rollNumber,
        class: s.class,
        section: s.section,
        session: s.session,
    }));

    res.status(200).json({
        success: true,
        count: formatted.length,
        data: formatted
    });
});
