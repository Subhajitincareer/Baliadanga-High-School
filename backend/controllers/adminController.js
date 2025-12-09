import User from '../models/User.js';
import AdminWhitelist from '../models/AdminWhitelist.js';
import asyncHandler from '../middlewares/asyncHandler.js';

// @desc    Check if email is in whitelist (is an admin)
// @route   GET /api/admin/whitelist/:email
// @access  Public
export const checkWhitelist = asyncHandler(async (req, res) => {
    try {
        const { email } = req.params;
        const entry = await AdminWhitelist.findOne({ email: email.toLowerCase() });
        res.status(200).json({ isAdmin: !!entry });
    } catch (error) {
        res.status(500).json({ message: 'Server check failed' });
    }
});

// @desc    Get all students
// @route   GET /api/admin/students
// @access  Private (Admin/Teacher)
export const getStudents = async (req, res) => {
    try {
        const users = await User.find({ role: 'student' }).select('-password');
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update user permissions
// @route   PUT /api/admin/permissions/:userId
// @access  Private (Admin only)
export const updateUserPermissions = asyncHandler(async (req, res) => {
    const { permissions } = req.body;
    const user = await User.findById(req.params.userId);

    if (user) {
        user.permissions = permissions;
        const updatedUser = await user.save();
        res.json({
            success: true,
            data: updatedUser
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});
