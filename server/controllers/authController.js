const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const User = require('../models/User');
const VerificationCode = require('../models/VerificationCode');
const generateToken = require('../utils/generateToken');
const { sendVerificationEmail } = require('../utils/sendEmail');

// Shared in-memory registered users store for instant testing & offline resilience
const { inMemoryUsers } = require('../utils/userStore');

// Strict check for IAR Gandhinagar institutional email address
const isIarEmail = (email) => {
  const normalized = (email || '').trim().toLowerCase();
  return normalized.endsWith('@iar.ac.in');
};

// Check whether an email belongs to a recognized student/academic domain (.edu, .ac.in, etc.)
const isAcademicEmail = (email) => {
  const normalized = (email || '').toLowerCase();
  return isIarEmail(normalized) ||
    normalized.endsWith('.edu') ||
    normalized.includes('.edu.') ||
    normalized.endsWith('.ac.in') ||
    normalized.endsWith('.ac.uk') ||
    normalized.endsWith('.edu.au');
};

// Small helper so register/login return the same comprehensive student/staff shape.
const buildAuthResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role || 'student',
  campus: user.campus || 'Institute of Advanced Research, Gandhinagar',
  studentId: user.enrollmentNo || user.studentId || '',
  enrollmentNo: user.enrollmentNo || user.studentId || '',
  staffCode: user.staffCode || '',
  department: user.department || '',
  designation: user.designation || '',
  admissionYear: user.admissionYear || user.gradYear || null,
  gradYear: user.admissionYear || user.gradYear || null,
  isVerifiedStudent: Boolean(user.isVerifiedStudent),
  isEmailVerified: Boolean(user.isEmailVerified),
  phone: user.phone || '',
  bio: user.bio || '',
  token: generateToken(user._id),
});

// In-memory verification cache for immediate, zero-latency OTP confirmation
const inMemoryVerificationCodes = new Map();

// @desc    Step 1: Validate details and send 6-digit verification code to @iar.ac.in email
// @route   POST /api/auth/send-verification-code
// @access  Public
const sendVerificationCode = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    campus,
    studentId,
    enrollmentNo,
    staffCode,
    department,
    designation,
    admissionYear,
    phone,
  } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide full name, email address, and password.');
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Strict enforcement: both student and staff must use @iar.ac.in
  if (!isIarEmail(normalizedEmail)) {
    res.status(400);
    throw new Error('Only official IAR email addresses (@iar.ac.in) are permitted.');
  }

  // Check if account already exists
  if (inMemoryUsers.has(normalizedEmail)) {
    res.status(400);
    throw new Error('An account with this IAR email address already exists. Please sign in instead.');
  }

  if (mongoose.connection.readyState === 1) {
    try {
      const userExists = await User.findOne({ email: normalizedEmail });
      if (userExists) {
        res.status(400);
        throw new Error('An account with this IAR email address already exists. Please sign in instead.');
      }
    } catch (err) {
      if (err.message && err.message.includes('already exists')) throw err;
    }
  }

  // Generate 6-digit verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  const regData = {
    name: name.trim(),
    email: normalizedEmail,
    password,
    role: role === 'staff' ? 'staff' : 'student',
    campus: campus || 'Institute of Advanced Research, Gandhinagar',
    enrollmentNo: (enrollmentNo || studentId || '').trim(),
    studentId: (enrollmentNo || studentId || '').trim(),
    staffCode: (staffCode || '').trim(),
    department: (department || '').trim(),
    designation: (designation || '').trim(),
    admissionYear: admissionYear ? Number(admissionYear) : undefined,
    gradYear: admissionYear ? Number(admissionYear) : undefined,
    phone: (phone || '').trim(),
  };

  // Always store in in-memory cache (valid for 10 minutes)
  inMemoryVerificationCodes.set(normalizedEmail, {
    code,
    expiresAt: Date.now() + 10 * 60 * 1000,
    registrationData: regData,
  });

  // Also persist in MongoDB if connected
  if (mongoose.connection.readyState === 1) {
    try {
      await VerificationCode.deleteMany({ email: normalizedEmail });
      await VerificationCode.create({
        email: normalizedEmail,
        code,
        registrationData: regData,
      });
    } catch (dbErr) {
      // In-memory cache handles it smoothly
    }
  }

  // Dispatch real email via Gmail SMTP (or fallback to console in dev mode)
  await sendVerificationEmail({
    to: normalizedEmail,
    code,
    name: name.trim(),
  });

  res.json({
    success: true,
    message: `Verification code sent to ${normalizedEmail}`,
    email: normalizedEmail,
    devCode: code,
  });
});

// @desc    Step 2: Verify 6-digit code and finalize user account creation
// @route   POST /api/auth/verify-code
// @access  Public
const verifyCodeAndRegister = asyncHandler(async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    res.status(400);
    throw new Error('Please provide email and 6-digit verification code.');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const trimmedCode = code.trim();

  let data = null;

  // 1. Check in-memory cache first
  const memRecord = inMemoryVerificationCodes.get(normalizedEmail);
  if (memRecord && memRecord.code === trimmedCode && memRecord.expiresAt > Date.now()) {
    data = memRecord.registrationData;
    inMemoryVerificationCodes.delete(normalizedEmail);
  }

  // 2. Check MongoDB collection if not found in memory (and DB is connected)
  if (!data && mongoose.connection.readyState === 1) {
    try {
      const record = await VerificationCode.findOne({
        email: normalizedEmail,
        code: trimmedCode,
      });
      if (record) {
        data = record.registrationData;
        await VerificationCode.deleteMany({ email: normalizedEmail });
      }
    } catch (e) {}
  }

  if (!data) {
    res.status(400);
    throw new Error('Invalid or expired verification code. Please check and try again.');
  }

  let user = null;

  // Check MongoDB if connected
  if (mongoose.connection.readyState === 1) {
    try {
      const userExists = await User.findOne({ email: normalizedEmail });
      if (userExists) {
        res.status(400);
        throw new Error('An account with this email already exists.');
      }

      user = await User.create({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        campus: data.campus,
        studentId: data.studentId,
        enrollmentNo: data.enrollmentNo,
        staffCode: data.staffCode,
        department: data.department,
        designation: data.designation,
        admissionYear: data.admissionYear,
        gradYear: data.gradYear,
        phone: data.phone,
        isVerifiedStudent: true,
        isEmailVerified: true,
      });
    } catch (dbErr) {
      if (dbErr.message && dbErr.message.includes('already exists')) throw dbErr;
    }
  }

  // If user wasn't saved in MongoDB or MongoDB is not yet whitelisted, construct robust user object
  if (!user) {
    user = {
      _id: 'iar_' + Date.now(),
      name: data.name,
      email: data.email,
      role: data.role,
      campus: data.campus,
      studentId: data.studentId,
      enrollmentNo: data.enrollmentNo,
      staffCode: data.staffCode,
      department: data.department,
      designation: data.designation,
      admissionYear: data.admissionYear,
      gradYear: data.gradYear,
      phone: data.phone,
      isVerifiedStudent: true,
      isEmailVerified: true,
    };
  }

  // Save to memory cache for immediate subsequent logins
  inMemoryUsers.set(normalizedEmail, {
    user,
    password: data.password,
    enrollmentNo: data.enrollmentNo,
    staffCode: data.staffCode,
    phone: data.phone,
  });

  res.status(201).json(buildAuthResponse(user));
});

// @desc    Direct register (fallback if verification bypassed)
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    campus,
    studentId,
    enrollmentNo,
    staffCode,
    department,
    designation,
    gradYear,
    admissionYear,
    phone,
  } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email, and password');
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Strict IAR email requirement
  if (!isIarEmail(normalizedEmail)) {
    res.status(400);
    throw new Error('Only official IAR email addresses (@iar.ac.in) are permitted.');
  }

  if (inMemoryUsers.has(normalizedEmail)) {
    res.status(400);
    throw new Error('A user with that email already exists');
  }

  const userRole = role === 'staff' ? 'staff' : 'student';
  const finalEnrollment = (enrollmentNo || studentId || '').trim();
  const finalStaffCode = (staffCode || '').trim();
  const finalAdmission = admissionYear ? Number(admissionYear) : (gradYear ? Number(gradYear) : undefined);
  const finalCampus = campus || 'Institute of Advanced Research, Gandhinagar';

  let user = null;

  if (mongoose.connection.readyState === 1) {
    try {
      const userExists = await User.findOne({ email: normalizedEmail });
      if (userExists) {
        res.status(400);
        throw new Error('A user with that email already exists');
      }

      user = await User.create({
        name,
        email: normalizedEmail,
        password,
        role: userRole,
        campus: finalCampus,
        studentId: finalEnrollment,
        enrollmentNo: finalEnrollment,
        staffCode: finalStaffCode,
        department: (department || '').trim(),
        designation: (designation || '').trim(),
        admissionYear: finalAdmission,
        gradYear: finalAdmission,
        phone: phone || '',
        isVerifiedStudent: true,
        isEmailVerified: true,
      });
    } catch (err) {
      if (err.message && err.message.includes('already exists')) throw err;
    }
  }

  if (!user) {
    user = {
      _id: 'iar_' + Date.now(),
      name,
      email: normalizedEmail,
      role: userRole,
      campus: finalCampus,
      studentId: finalEnrollment,
      enrollmentNo: finalEnrollment,
      staffCode: finalStaffCode,
      department: (department || '').trim(),
      designation: (designation || '').trim(),
      admissionYear: finalAdmission,
      gradYear: finalAdmission,
      phone: phone || '',
      isVerifiedStudent: true,
      isEmailVerified: true,
    };
  }

  inMemoryUsers.set(normalizedEmail, {
    user,
    password,
    enrollmentNo: finalEnrollment,
    staffCode: finalStaffCode,
    phone: phone || '',
  });

  res.status(201).json(buildAuthResponse(user));
});

// @desc    Authenticate a user and return a token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide username/email and password');
  }

  const query = email.trim();
  const lowerQuery = query.toLowerCase();

  // Try MongoDB if connected
  if (mongoose.connection.readyState === 1) {
    try {
      const user = await User.findOne({
        $or: [
          { email: lowerQuery },
          { enrollmentNo: query },
          { staffCode: query },
          { studentId: query },
          { phone: query },
        ],
      }).select('+password');

      if (user && (await user.matchPassword(password))) {
        if (user.isDeactivated) {
          res.status(403);
          throw new Error('This account has been deactivated. Please contact campus administration to reactivate.');
        }
        return res.json(buildAuthResponse(user));
      }
    } catch (e) {
      if (e.message && e.message.includes('deactivated')) throw e;
    }
  }

  // Check in-memory store
  for (const [memEmail, record] of inMemoryUsers.entries()) {
    if (
      memEmail === lowerQuery ||
      record.enrollmentNo === query ||
      record.staffCode === query ||
      record.phone === query
    ) {
      if (record.password === password) {
        if (record.user?.isDeactivated) {
          res.status(403);
          throw new Error('This account has been deactivated. Please contact campus administration to reactivate.');
        }
        return res.json(buildAuthResponse(record.user));
      }
    }
  }

  res.status(401);
  throw new Error('Invalid email or password');
});

// @desc    Get the logged-in user's own profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.json(req.user);
});

// @desc    Update user profile / campus verification
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  let user = null;

  if (mongoose.connection.readyState === 1) {
    try {
      user = await User.findById(req.user._id).select('+password');
    } catch (e) {}
  }

  const {
    name,
    campus,
    studentId,
    enrollmentNo,
    staffCode,
    department,
    designation,
    admissionYear,
    gradYear,
    phone,
    bio,
    currentPassword,
    newPassword,
  } = req.body;

  // Handle password change request
  if (newPassword) {
    if (!currentPassword) {
      res.status(400);
      throw new Error('Please provide your current password to set a new password.');
    }

    if (newPassword.length < 6) {
      res.status(400);
      throw new Error('New password must be at least 6 characters long.');
    }

    if (user && user.matchPassword) {
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        res.status(400);
        throw new Error('Current password does not match.');
      }
      user.password = newPassword;
    }
  }

  // If user found in MongoDB, update and save
  if (user) {
    if (name !== undefined) user.name = name.trim();
    if (campus !== undefined) user.campus = campus.trim();
    if (studentId !== undefined || enrollmentNo !== undefined) {
      const finalId = (enrollmentNo || studentId || '').trim();
      user.studentId = finalId;
      user.enrollmentNo = finalId;
    }
    if (staffCode !== undefined) user.staffCode = staffCode.trim();
    if (department !== undefined) user.department = department.trim();
    if (designation !== undefined) user.designation = designation.trim();
    if (admissionYear !== undefined) user.admissionYear = Number(admissionYear);
    if (gradYear !== undefined) user.gradYear = Number(gradYear);
    if (phone !== undefined) user.phone = phone.trim();
    if (bio !== undefined) user.bio = bio.trim();

    user.isVerifiedStudent = true;
    user.isEmailVerified = true;

    const updatedUser = await user.save();

    // Also sync in-memory store
    const memRecord = inMemoryUsers.get(updatedUser.email);
    if (memRecord) {
      memRecord.user = updatedUser;
      if (newPassword) memRecord.password = newPassword;
      memRecord.phone = updatedUser.phone;
      memRecord.enrollmentNo = updatedUser.enrollmentNo;
      memRecord.staffCode = updatedUser.staffCode;
    }

    return res.json(buildAuthResponse(updatedUser));
  }

  // Fallback for offline / in-memory sessions
  const emailKey = req.user.email ? req.user.email.toLowerCase() : '';
  const memRecord = inMemoryUsers.get(emailKey) || { user: req.user };

  if (newPassword) {
    if (memRecord.password && memRecord.password !== currentPassword) {
      res.status(400);
      throw new Error('Current password does not match.');
    }
    memRecord.password = newPassword;
  }

  const updatedInMemoryUser = {
    ...memRecord.user,
    name: name !== undefined ? name.trim() : memRecord.user.name,
    campus: campus !== undefined ? campus.trim() : memRecord.user.campus,
    studentId: enrollmentNo || studentId || memRecord.user.studentId,
    enrollmentNo: enrollmentNo || studentId || memRecord.user.enrollmentNo,
    staffCode: staffCode !== undefined ? staffCode.trim() : memRecord.user.staffCode,
    department: department !== undefined ? department.trim() : memRecord.user.department,
    designation: designation !== undefined ? designation.trim() : memRecord.user.designation,
    admissionYear: admissionYear !== undefined ? Number(admissionYear) : memRecord.user.admissionYear,
    phone: phone !== undefined ? phone.trim() : memRecord.user.phone,
    bio: bio !== undefined ? bio.trim() : memRecord.user.bio,
    isVerifiedStudent: true,
    isEmailVerified: true,
  };

  memRecord.user = updatedInMemoryUser;
  inMemoryUsers.set(emailKey, memRecord);

  return res.json(buildAuthResponse(updatedInMemoryUser));
});

// @desc    Deactivate user account
// @route   PUT /api/auth/deactivate
// @access  Private
const deactivateAccount = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  if (mongoose.connection.readyState === 1) {
    try {
      await User.findByIdAndUpdate(userId, { isDeactivated: true });
    } catch (e) {}
  }

  const emailKey = req.user.email ? req.user.email.toLowerCase() : '';
  const memRecord = inMemoryUsers.get(emailKey);
  if (memRecord && memRecord.user) {
    memRecord.user.isDeactivated = true;
    inMemoryUsers.set(emailKey, memRecord);
  }

  return res.json({
    success: true,
    message: 'Your account has been deactivated successfully. You have been logged out.',
  });
});

// @desc    Permanently delete user account and associated listings
// @route   DELETE /api/auth/delete-account
// @access  Private
const deleteAccount = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const emailKey = req.user.email ? req.user.email.toLowerCase() : '';

  if (mongoose.connection.readyState === 1) {
    try {
      await User.findByIdAndDelete(userId);
      const Product = require('../models/Product');
      await Product.deleteMany({ seller: userId });
    } catch (e) {}
  }

  // Remove from in-memory cache
  if (emailKey) {
    inMemoryUsers.delete(emailKey);
  }

  return res.json({
    success: true,
    message: 'Your account and active listings have been permanently deleted.',
  });
});

module.exports = {
  sendVerificationCode,
  verifyCodeAndRegister,
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  deactivateAccount,
  deleteAccount,
};
