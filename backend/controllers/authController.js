import User from '../models/User.js';
import AdminWhitelist from '../models/AdminWhitelist.js';
import { generateToken } from '../utils/generateToken.js';
import asyncHandler from '../middlewares/asyncHandler.js';

// ─── Cookie Helper ────────────────────────────────────────────────────────────
// Sets a signed httpOnly JWT cookie. JS on the client can never read this value.
const setCookieToken = (res, token) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,               // HTTPS only in production
    sameSite: isProduction ? 'none' : 'lax', // 'none' required for cross-site (Vercel -> Render)
    maxAge: 7 * 24 * 60 * 60 * 1000,    // 7 days in ms
  };

  res.cookie('jwt', token, cookieOptions);
};

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
    // Check password
    const isMatch = await user.comparePassword(password);

    if (isMatch) {
      // ✅ Set httpOnly cookie — token never exposed to client-side JS
      setCookieToken(res, generateToken(user._id));

      return res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          studentId: user.studentId,
          role: user.role,
          permissions: user.permissions,
          // No token here — it's in the cookie
        }
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials - User not found'
    });
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

  const user = await User.findOne({ email }).select('+password');

  if (user && (await user.comparePassword(password))) {
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized as an admin'
      });
    }

    // ✅ Set httpOnly cookie — token never exposed to client-side JS
    setCookieToken(res, generateToken(user._id));

    return res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions
        // No token here — it's in the cookie
      }
    });
  }

  res.status(401).json({
    success: false,
    message: 'Invalid credentials'
  });
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0), // Immediately expired
  });
  res.json({ success: true, message: 'Logged out successfully' });
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

// @desc    Seed admin user
// @route   POST /api/auth/seed-admin
// @access  DISABLED in production. Only runs in 'development' or 'test' environments.
export const seedAdmin = asyncHandler(async (req, res) => {
  // ✅ SECURITY GUARD: Block this endpoint entirely in production.
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: 'This endpoint is disabled in production.'
    });
  }

  const { secretKey } = req.body;
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@baliadanga.com';
  // ⚠️ IMPORTANT: Set SEED_ADMIN_PASSWORD in your .env file. Never hardcode passwords.
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!adminPassword) {
    return res.status(500).json({ success: false, message: 'SEED_ADMIN_PASSWORD is not set in environment.' });
  }

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

// @desc    First-run setup — create the very first admin account
// @route   POST /api/auth/setup-admin
// @access  Public — BUT self-locks permanently once any admin exists
// ─────────────────────────────────────────────────────────────────────────────
// This is the "headmaster setup" endpoint. It is safe to leave enabled because:
//   • It checks if ANY admin/principal account already exists in the DB
//   • If one exists → returns 403 immediately, no matter what
//   • If ZERO admins exist → creates the account + adds to whitelist
// There is no secret key required — the "zero admin" check IS the security.
export const setupAdmin = asyncHandler(async (req, res) => {
  // 1. Check if any admin already exists — if so, lock this endpoint forever
  const existingAdmin = await User.findOne({
    role: { $in: ['admin', 'principal'] }
  });

  if (existingAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Setup already completed. An admin account already exists.',
      setupDone: true
    });
  }

  // 2. Validate input
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide name, email, and password'
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 8 characters'
    });
  }

  // 3. Create the admin user
  const admin = await User.create({
    name,
    email: email.toLowerCase().trim(),
    password,
    role: 'admin'
  });

  // 4. Add to whitelist so admin-login endpoint also accepts this email
  await AdminWhitelist.create({ email: email.toLowerCase().trim() });

  // 5. Set auth cookie and return success
  setCookieToken(res, generateToken(admin._id));

  res.status(201).json({
    success: true,
    message: `Admin account created! Welcome, ${admin.name}. Redirecting to dashboard...`,
    setupDone: true,
    data: {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role
    }
  });
});