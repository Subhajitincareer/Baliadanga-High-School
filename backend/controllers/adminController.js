import User from '../models/User.js';
import asyncHandler from '../middlewares/asyncHandler.js';

// @desc    Check if email is in whitelist (is an admin)
// @route   GET /api/admin/whitelist/:email
// @access  Public (Used for pre-login check)
export const checkWhitelist = asyncHandler(async (req, res) => {
    const email = req.params.email;

    const user = await User.findOne({ email });

    if (user && user.role === 'admin') {
        res.json({
            success: true,
            isAdmin: true
        });
    } else {
        // Return success: true but isAdmin: false so frontend knows it's not an admin
        // This isn't an error, just a negative result
        res.json({
            success: true,
            isAdmin: false
        });
    }
});
