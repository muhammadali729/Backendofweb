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
const { validationResult } = require("express-validator");
const { body } = require("express-validator");
const portfolio_1 = require("../model/portfolio");
const logger_1 = require("../logger");
const auth_1 = require("../../middleware/auth");
const router = express_1.default.Router();
// @route   GET /api/portfolio
// @desc    Get all portfolio projects
// @access  Public
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const category = req.query.category;
        const featured = req.query.featured === 'true';
        const search = req.query.search;
        const query = { isPublished: true };
        if (category)
            query.category = category;
        if (featured)
            query.isFeatured = true;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { client: { $regex: search, $options: 'i' } },
                { technologies: { $in: [new RegExp(search, 'i')] } },
            ];
        }
        const skip = (page - 1) * limit;
        const projects = yield portfolio_1.Portfolio.find(query)
            .sort({ order: 1, createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const total = yield portfolio_1.Portfolio.countDocuments(query);
        res.json({
            success: true,
            data: projects,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        logger_1.logger.error('Get portfolio error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
        });
    }
}));
// @route   GET /api/portfolio/categories
// @desc    Get all portfolio categories
// @access  Public
router.get('/categories', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield portfolio_1.Portfolio.aggregate([
            { $match: { isPublished: true } },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
        ]);
        res.json({
            success: true,
            data: categories,
        });
    }
    catch (error) {
        logger_1.logger.error('Get portfolio categories error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
        });
    }
}));
// @route   GET /api/portfolio/featured
// @desc    Get featured portfolio projects
// @access  Public
router.get('/featured', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const limit = parseInt(req.query.limit) || 6;
        const projects = yield portfolio_1.Portfolio.find({
            isFeatured: true,
            isPublished: true,
        })
            .sort({ order: 1, createdAt: -1 })
            .limit(limit);
        res.json({
            success: true,
            data: projects,
        });
    }
    catch (error) {
        logger_1.logger.error('Get featured portfolio error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
        });
    }
}));
// @route   GET /api/portfolio/:id
// @desc    Get single portfolio project
// @access  Public
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const project = yield portfolio_1.Portfolio.findById(req.params.id);
        if (!project || !project.isPublished) {
            res.status(404).json({
                success: false,
                error: 'Project not found',
            });
            return;
        }
        res.json({
            success: true,
            data: project,
        });
    }
    catch (error) {
        logger_1.logger.error('Get portfolio project error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
        });
    }
}));
// @route   POST /api/portfolio
// @desc    Create new portfolio project (admin only)
// @access  Private
router.post('/', auth_1.auth, [
    body('title')
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Title must be between 3 and 100 characters'),
    body('description')
        .trim()
        .isLength({ min: 10, max: 2000 })
        .withMessage('Description must be between 10 and 2000 characters'),
    body('shortDescription')
        .trim()
        .isLength({ min: 10, max: 200 })
        .withMessage('Short description must be between 10 and 200 characters'),
    body('category')
        .isIn(['website', 'mobile-app', 'ecommerce', 'saas', 'chatbot', 'crm', 'design', 'amazon-management', 'other'])
        .withMessage('Please select a valid category'),
    body('client')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Client name must be between 2 and 100 characters'),
    body('duration')
        .trim()
        .notEmpty()
        .withMessage('Duration is required'),
    body('budget')
        .trim()
        .notEmpty()
        .withMessage('Budget is required'),
    body('image')
        .notEmpty()
        .withMessage('Main image is required'),
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
        // Check if user is admin
        if (req.user.role !== 'admin') {
            res.status(403).json({
                success: false,
                error: 'Access denied',
            });
            return;
        }
        const project = new portfolio_1.Portfolio(req.body);
        yield project.save();
        res.status(201).json({
            success: true,
            message: 'Portfolio project created successfully',
            data: project,
        });
    }
    catch (error) {
        logger_1.logger.error('Create portfolio error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
        });
    }
}));
// @route   PUT /api/portfolio/:id
// @desc    Update portfolio project (admin only)
// @access  Private
router.put('/:id', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            res.status(403).json({
                success: false,
                error: 'Access denied',
            });
            return;
        }
        const project = yield portfolio_1.Portfolio.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!project) {
            res.status(404).json({
                success: false,
                error: 'Project not found',
            });
            return;
        }
        res.json({
            success: true,
            message: 'Portfolio project updated successfully',
            data: project,
        });
    }
    catch (error) {
        logger_1.logger.error('Update portfolio error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
        });
    }
}));
// @route   DELETE /api/portfolio/:id
// @desc    Delete portfolio project (admin only)
// @access  Private
router.delete('/:id', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            res.status(403).json({
                success: false,
                error: 'Access denied',
            });
            return;
        }
        const project = yield portfolio_1.Portfolio.findByIdAndDelete(req.params.id);
        if (!project) {
            res.status(404).json({
                success: false,
                error: 'Project not found',
            });
            return;
        }
        res.json({
            success: true,
            message: 'Portfolio project deleted successfully',
        });
    }
    catch (error) {
        logger_1.logger.error('Delete portfolio error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
        });
    }
}));
exports.default = router;
