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
exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = require("../utils/logger");
const user_1 = require("../utils/model/user");
const auth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
        if (!token) {
            res.status(401).json({
                success: false,
                error: 'No token, authorization denied',
            });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        const user = yield user_1.User.findById(decoded.userId).select('-password');
        if (!user) {
            res.status(401).json({
                success: false,
                error: 'Token is not valid',
            });
            return;
        }
        if (!user.isActive) {
            res.status(401).json({
                success: false,
                error: 'Account is deactivated',
            });
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        (_b = logger_1.logger === null || logger_1.logger === void 0 ? void 0 : logger_1.logger.error) === null || _b === void 0 ? void 0 : _b.call(logger_1.logger, 'Auth middleware error:', error); // Optional chaining for safety
        res.status(401).json({
            success: false,
            error: 'Token is not valid',
        });
    }
});
exports.auth = auth;
