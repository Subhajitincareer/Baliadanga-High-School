import User from '../models/User.js';
import AdminWhitelist from '../models/AdminWhitelist.js';
import { generateToken } from '../utils/generateToken.js';
import asyncHandler from '../middlewares/asyncHandler.js';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({
      success: false,
      message: 'User already exists'
    });
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password
  });

  if (user) {
    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        token: generateToken(user._id)
      }
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Invalid user data'
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, studentId, password } = req.body;

  let query = {};
  if (email) {
    query.email = email;
  } else if (studentId) {
    query.studentId = studentId;
  } else {
    return res.status(400).json({
      success: false,
      message: 'Please provide email or student ID'
    });
  }

  // Check for user
  let user = await User.findOne(query).select('+password');

  // Fallback: If login by studentId and User not found directly (legacy data support)
  if (!user && query.studentId) {
    // Dynamically import StudentProfile to avoid circular dependency issues if any, 
    // or just assume it's available or use mongoose.model
    const StudentProfile = (await import('../models/StudentProfile.js')).default;
    const profile = await StudentProfile.findOne({ studentId: query.studentId });
    if (profile) {
      user = await User.findById(profile.user).select('+password');
    }
  }

  if (user) {
    console.log(`Login attempt for: ${email || studentId}`);
    console.log(`User found. Role: ${user.role}`);

    // Check password
    const isMatch = await user.comparePassword(password);
    console.log(`Password match: ${isMatch}`);

    if (isMatch) {
      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          studentId: user.studentId,
          role: user.role,
          permissions: user.permissions,
          token: generateToken(user._id)
        }
      });
      return;
    }
  } else {
    console.log(`Login failed: User not found for ${email || studentId}`);
    res.status(401).json({
      success: false,
      message: 'Invalid credentials - User not found'
    });
    return;
  }

  res.status(401).json({
    success: false,
    message: 'Invalid credentials - Password mismatch'
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({
    success: true,
    data: user
  });
});

// @desc    Login admin
// @route   POST /api/auth/admin-login
// @access  Public
export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (user && (await user.comparePassword(password))) {
    // Check if user is admin
    if (user.role !== 'admin') {
      console.log(`Admin Login Failed: User ${email} is not an admin (Role: ${user.role})`);
      return res.status(401).json({
        success: false,
        message: 'Not authorized as an admin'
      });
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      }
    });
  } else {
    console.log(`Admin Login Failed: Invalid credentials for ${email}`);
    if (!user) console.log('Reason: User not found');
    else console.log('Reason: Password mismatch');

    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// @desc    Update password (authenticated user)
// @route   PUT /api/auth/updatepassword
// @access  Private
export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.comparePassword(currentPassword))) {
    return res.status(401).json({
      success: false,
      message: 'Incorrect current password'
    });
  }

  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password updated successfully'
  });
});

// @desc    Seed admin user (Temporary for production fix)
// @route   POST /api/auth/seed-admin
// @access  Public (Protected by secret key)
export const seedAdmin = asyncHandler(async (req, res) => {
  const { secretKey } = req.body;
  const adminEmail = 'admin@baliadanga.com';
  const adminPassword = 'adminpassword123';

  if (secretKey !== process.env.JWT_SECRET) {
    return res.status(401).json({ success: false, message: 'Invalid secret key' });
  }

  // 1. Create/Update User
  let user = await User.findOne({ email: adminEmail });
  if (user) {
    user.password = adminPassword;
    user.role = 'admin';
    await user.save();
    console.log('Admin user updated');
  } else {
    user = await User.create({
      name: 'Super Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'admin'
    });
    console.log('Admin user created');
  }

  // 2. Add to Whitelist
  const whitelistEntry = await AdminWhitelist.findOne({ email: adminEmail });
  if (!whitelistEntry) {
    await AdminWhitelist.create({ email: adminEmail });
    console.log('Admin added to whitelist');
  }

  res.json({
    success: true,
    message: 'Admin seeded successfully'
  });
});