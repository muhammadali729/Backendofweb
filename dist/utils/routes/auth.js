"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const user_1 = require("../model/user");
const email_1 = require("../email");
const logger_1 = require("../logger");
const auth_1 = require("../../middleware/auth");
const router = express_1.default.Router();
const { validationResult } = require("express-validator");
const { body } = require("express-validator");
const generateToken = (userId) => {
    const secret = process.env.JWT_SECRET || 'fallback-secret';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    // Use any type to bypass JWT library strict typing issues
    return jsonwebtoken_1.default.sign({ userId }, secret, { expiresIn });
};
router.post('/register', [
    body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                errors: errors.array(),
            });
            return;
        }
        const { name, email, password } = req.body;
        // Check if user already exists
        const existingUser = yield user_1.User.findOne({ email });
        if (existingUser) {
            res.status(400).json({
                success: false,
                error: 'User with this email already exists',
            });
            return;
        }
        // Create verification token
        const emailVerificationToken = crypto_1.default.randomBytes(32).toString('hex');
        const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        // Create user
        const user = new user_1.User({
            name,
            email,
            password,
            emailVerificationToken,
            emailVerificationExpires,
        });
        yield user.save();
        // Send verification email
        const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${emailVerificationToken}`;
        yield (0, email_1.sendEmail)({
            to: email,
            subject: 'Verify your email address',
            html: `
        <h1>Welcome to TechDev.inc!</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
      `,
        });
        // Generate token
        const token = generateToken(user._id.toString());
        res.status(201).json({
            success: true,
            message: 'User registered successfully. Please check your email to verify your account.',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isEmailVerified: user.isEmailVerified,
            },
        });
    }
    catch (error) {
        logger_1.logger.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
        });
    }
}));
// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                errors: errors.array(),
            });
            return;
        }
        const { email, password } = req.body;
        // Find user and include password
        const user = yield user_1.User.findOne({ email }).select('+password');
        if (!user) {
            res.status(401).json({
                success: false,
                error: 'Invalid credentials',
            });
            return;
        }
        // Check if account is locked
        if (user.isLocked) {
            res.status(423).json({
                success: false,
                error: 'Account is temporarily locked. Please try again later.',
            });
            return;
        }
        // Check password
        const isPasswordValid = yield user.comparePassword(password);
        if (!isPasswordValid) {
            yield user.incLoginAttempts();
            res.status(401).json({
                success: false,
                error: 'Invalid credentials',
            });
            return;
        }
        // Reset login attempts on successful login
        yield user.resetLoginAttempts();
        // Generate token
        const token = generateToken(user._id.toString());
        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isEmailVerified: user.isEmailVerified,
            },
        });
    }
    catch (error) {
        logger_1.logger.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
        });
    }
}));
// @route   GET /api/auth/verify-email/:token
// @desc    Verify email address
// @access  Public
router.get('/verify-email/:token', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        const user = yield user_1.User.findOne({
            emailVerificationToken: token,
            emailVerificationExpires: { $gt: Date.now() },
        });
        if (!user) {
            res.status(400).json({
                success: false,
                error: 'Invalid or expired verification token',
            });
            return;
        }
        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        yield user.save();
        res.json({
            success: true,
            message: 'Email verified successfully',
        });
    }
    catch (error) {
        logger_1.logger.error('Email verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
        });
    }
}));
// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                errors: errors.array(),
            });
            return;
        }
        const { email } = req.body;
        const user = yield user_1.User.findOne({ email });
        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found',
            });
            return;
        }
        // Generate reset token
        const passwordResetToken = crypto_1.default.randomBytes(32).toString('hex');
        const passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        user.passwordResetToken = passwordResetToken;
        user.passwordResetExpires = passwordResetExpires;
        yield user.save();
        // Send reset email
        const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${passwordResetToken}`;
        yield (0, email_1.sendEmail)({
            to: email,
            subject: 'Password Reset Request',
            html: `
        <h1>Password Reset Request</h1>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
        });
        res.json({
            success: true,
            message: 'Password reset email sent',
        });
    }
    catch (error) {
        logger_1.logger.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
        });
    }
}));
// @route   POST /api/auth/reset-password/:token
// @desc    Reset password
// @access  Public
router.post('/reset-password/:token', [
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                errors: errors.array(),
            });
            return;
        }
        const { token } = req.params;
        const { password } = req.body;
        const user = yield user_1.User.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: Date.now() },
        });
        if (!user) {
            res.status(400).json({
                success: false,
                error: 'Invalid or expired reset token',
            });
            return;
        }
        // Update password
        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        yield user.save();
        res.json({
            success: true,
            message: 'Password reset successfully',
        });
    }
    catch (error) {
        logger_1.logger.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
        });
    }
}));
// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_1.User.findById(req.user.id).select('-password');
        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found',
            });
            return;
        }
        res.json({
            success: true,
            user,
        });
    }
    catch (error) {
        logger_1.logger.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
        });
    }
}));
// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth_1.auth, [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    body('phone')
        .optional()
        .matches(/^[\+]?[1-9][\d]{0,15}$/)
        .withMessage('Please provide a valid phone number'),
    body('company')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Company name cannot be more than 100 characters'),
    body('position')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Position cannot be more than 50 characters'),
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                errors: errors.array(),
            });
            return;
        }
        const { name, phone, company, position } = req.body;
        const user = yield user_1.User.findById(req.user.id);
        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found',
            });
            return;
        }
        // Update fields
        if (name)
            user.name = name;
        if (phone)
            user.phone = phone;
        if (company)
            user.company = company;
        if (position)
            user.position = position;
        yield user.save();
        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                company: user.company,
                position: user.position,
                role: user.role,
                isEmailVerified: user.isEmailVerified,
            },
        });
    }
    catch (error) {
        logger_1.logger.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
        });
    }
}));
exports.default = router;
