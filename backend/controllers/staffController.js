import Staff from '../models/Staff.js';
import User from '../models/User.js';

// @desc    Get all staff
// @route   GET /api/staff
// @access  Private (Admin)
export const getStaff = async (req, res, next) => {
    try {
        const staff = await Staff.find().sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: staff.length,
            data: staff
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get single staff
// @route   GET /api/staff/:id
// @access  Private (Admin)
export const getStaffById = async (req, res, next) => {
    try {
        const staff = await Staff.findById(req.params.id);

        if (!staff) {
            return res.status(404).json({ success: false, message: 'Staff not found' });
        }

        res.status(200).json({
            success: true,
            data: staff
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create new staff
// @route   POST /api/staff
// @access  Private (Admin)
export const createStaff = async (req, res, next) => {
    try {
        let { fullName, email, position, department, employeeId } = req.body;

        // Auto-generate Employee ID if not provided
        if (!employeeId) {
            const lastStaff = await Staff.findOne().sort({ employeeId: -1 });
            if (lastStaff && lastStaff.employeeId) {
                const lastId = lastStaff.employeeId;
                const numericPart = parseInt(lastId.split('-')[1]);
                const nextId = numericPart + 1;
                employeeId = `EMP-${nextId.toString().padStart(3, '0')}`;
            } else {
                employeeId = 'EMP-001';
            }
        }

        // 1. Check if User account exists, if not create one
        let user = await User.findOne({ email });
        let userId = null;

        if (!user) {
            // Create user with default password
            // Map position to role
            let role = 'staff';
            if (position === 'Teacher') role = 'teacher';
            if (position === 'Principal') role = 'principal';
            if (position === 'Vice Principal') role = 'vice_principal';
            if (position === 'Coordinator') role = 'coordinator';
            if (position === 'Admin') role = 'admin';

            user = await User.create({
                name: fullName,
                email,
                password: 'changeme123', // Default password
                role
            });
            console.log(`Created new User for staff: ${email} with role: ${role}`);
        }
        userId = user._id;

        // 2. Create Staff Profile
        const staff = await Staff.create({
            ...req.body,
            employeeId, // Use the auto-generated or provided ID
            userId
        });

        res.status(201).json({
            success: true,
            data: staff,
            message: 'Staff profile and User account created successfully'
        });
    } catch (err) {
        // If Duplicate key error (likely email or employeeId)
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: 'Email or Employee ID already exists' });
        }
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Update staff
// @route   PUT /api/staff/:id
// @access  Private (Admin)
export const updateStaff = async (req, res, next) => {
    try {
        let staff = await Staff.findById(req.params.id);

        if (!staff) {
            return res.status(404).json({ success: false, message: 'Staff not found' });
        }

        staff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        // Optionally update User name/email if they changed (not implemented for simplicity now)

        res.status(200).json({
            success: true,
            data: staff
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Delete staff
// @route   DELETE /api/staff/:id
// @access  Private (Admin)
export const deleteStaff = async (req, res, next) => {
    try {
        const staff = await Staff.findById(req.params.id);

        if (!staff) {
            return res.status(404).json({ success: false, message: 'Staff not found' });
        }

        // Also find associated user and delete? 
        // Strategy: Delete Staff profile, leave User account (or disable it). 
        // For strict management, let's delete User too if found.
        if (staff.userId) {
            await User.findByIdAndDelete(staff.userId);
        }

        await staff.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get current staff profile
// @route   GET /api/staff/profile
// @access  Private (Staff/Admin)
export const getStaffByUserId = async (req, res, next) => {
    try {
        let staff = await Staff.findOne({ userId: req.user.id });

        if (!staff) {
            console.log(`Staff profile not found for user ${req.user.name}, auto-creating...`);

            // Map role to position (title case)
            const roleToPosition = {
                'teacher': 'Teacher',
                'principal': 'Principal',
                'vice_principal': 'Vice Principal',
                'coordinator': 'Coordinator',
                'admin': 'Admin',
                'staff': 'Staff'
            };
            const position = roleToPosition[req.user.role] || 'Staff'; // Default to Staff

            // Generate simple Employee ID
            const employeeId = `EMP-${Date.now().toString().slice(-6)}`;

            staff = await Staff.create({
                userId: req.user.id,
                fullName: req.user.name,
                email: req.user.email,
                position: position,
                department: 'General',
                employeeId: employeeId,
                isActive: true
            });
        }

        res.status(200).json({
            success: true,
            data: staff
        });
    } catch (err) {
        console.error("Error in getStaffByUserId:", err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update current staff profile
// @route   PUT /api/staff/profile
// @access  Private (Staff/Admin)
export const updateStaffProfile = async (req, res, next) => {
    try {
        const staff = await Staff.findOne({ userId: req.user.id });

        if (!staff) {
            return res.status(404).json({ success: false, message: 'Staff profile not found' });
        }

        const updatedStaff = await Staff.findByIdAndUpdate(staff._id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: updatedStaff
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
