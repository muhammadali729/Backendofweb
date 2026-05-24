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
const user_1 = require("../model/user");
const logger_1 = require("../logger");
const auth_1 = require("../../middleware/auth");
const router = express_1.default.Router();
// @route   GET /api/
// @desc    Auth test route
// @access  Private
router.get('/', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.status(200).json({ success: true, message: 'Authenticated Route Hit' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
}));
// @route   GET /api/users
// @desc    Get all users
// @access  Public (you can apply `auth` if you want)
router.get('/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield user_1.User.find().select('-password');
        res.status(200).json({
            success: true,
            data: users,
        });
    }
    catch (error) {
        logger_1.logger.error('Get users error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
        });
    }
}));
exports.default = router;
