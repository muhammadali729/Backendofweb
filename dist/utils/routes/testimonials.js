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
const testimonials_1 = require("../model/testimonials");
const logger_1 = require("../logger");
const auth_1 = require("../../middleware/auth");
const router = express_1.default.Router();
const { validationResult } = require("express-validator");
const { body } = require("express-validator");
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const service = req.query.service;
        const featured = req.query.featured === 'true';
        const query = { isPublished: true };
        if (service)
            query.service = service;
        if (featured)
            query.isFeatured = true;
        const skip = (page - 1) * limit;
        const testimonials = yield testimonials_1.Testimonial.find(query)
            .sort({ order: 1, createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const total = yield testimonials_1.Testimonial.countDocuments(query);
        res.json({
            success: true,
            data: testimonials,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        logger_1.logger.error('Get testimonials error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
        });
    }
}));
router.get('/featured', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const limit = parseInt(req.query.limit) || 6;
        const testimonials = yield testimonials_1.Testimonial.find({
            isFeatured: true,
            isPublished: true,
        })
            .sort({ order: 1, rating: -1 })
            .limit(limit);
        res.json({
            success: true,
            data: testimonials,
        });
    }
    catch (error) {
        logger_1.logger.error('Get featured testimonials error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
        });
    }
}));
router.post('/', auth_1.auth, [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
    body('position')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Position must be between 2 and 100 characters'),
    body('company')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Company name must be between 2 and 100 characters'),
    body('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be between 1 and 5'),
    body('content')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Content must be between 10 and 1000 characters'),
    body('service')
        .isIn(['amazon', 'website', 'mobile', 'design', 'chatbot', 'crm', 'saas', 'other'])
        .withMessage('Please select a valid service'),
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
        const testimonial = new testimonials_1.Testimonial(req.body);
        yield testimonial.save();
        res.status(201).json({
            success: true,
            message: 'Testimonial created successfully',
            data: testimonial,
        });
    }
    catch (error) {
        logger_1.logger.error('Create testimonial error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
        });
    }
}));
exports.default = router;
