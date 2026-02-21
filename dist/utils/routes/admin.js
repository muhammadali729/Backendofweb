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
const contact_1 = require("../model/contact");
const portfolio_1 = require("../model/portfolio");
const testimonials_1 = require("../model/testimonials");
const user_1 = require("../model/user");
const logger_1 = require("../logger");
const auth_1 = require("../../middleware/auth");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.get('/dashboard', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            res.status(403).json({
                success: false,
                error: 'Access denied',
            });
        }
        // Get counts
        const totalContacts = yield contact_1.Contact.countDocuments();
        const newContacts = yield contact_1.Contact.countDocuments({ status: 'new' });
        const totalPortfolio = yield portfolio_1.Portfolio.countDocuments();
        const publishedPortfolio = yield portfolio_1.Portfolio.countDocuments({ isPublished: true });
        const totalTestimonials = yield testimonials_1.Testimonial.countDocuments();
        const publishedTestimonials = yield testimonials_1.Testimonial.countDocuments({ isPublished: true });
        const totalUsers = yield user_1.User.countDocuments();
        // Get contacts by source
        const contactsBySource = yield contact_1.Contact.aggregate([
            {
                $group: {
                    _id: '$source',
                    count: { $sum: 1 },
                },
            },
        ]);
        // Get contacts by service
        const contactsByService = yield contact_1.Contact.aggregate([
            {
                $group: {
                    _id: '$service',
                    count: { $sum: 1 },
                },
            },
        ]);
        // Get recent contacts
        const recentContacts = yield contact_1.Contact.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name email service status createdAt');
        // Get portfolio by category
        const portfolioByCategory = yield portfolio_1.Portfolio.aggregate([
            { $match: { isPublished: true } },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                },
            },
        ]);
        res.json({
            success: true,
            data: {
                counts: {
                    contacts: totalContacts,
                    newContacts,
                    portfolio: totalPortfolio,
                    publishedPortfolio,
                    testimonials: totalTestimonials,
                    publishedTestimonials,
                    users: totalUsers,
                },
                contactsBySource,
                contactsByService,
                portfolioByCategory,
                recentContacts,
            },
        });
    }
    catch (error) {
        logger_1.logger.error('Get dashboard error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
        });
    }
}));
exports.default = router;
