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
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = require("./utils/logger");
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const mongoURI = process.env.NODE_ENV === 'production'
            ? process.env.MONGO_URI_PROD
            : process.env.MONGO_URI;
        if (!mongoURI) {
            throw new Error('❌ MongoDB URI is not defined in environment variables');
        }
        const conn = yield mongoose_1.default.connect(mongoURI);
        logger_1.logger.info(`✅ MongoDB Connected: ${((_a = conn.connection) === null || _a === void 0 ? void 0 : _a.host) || 'Unknown Host'}`);
        mongoose_1.default.connection.on('error', (err) => {
            logger_1.logger.error(`❌ MongoDB connection error: ${err.message}`);
        });
        mongoose_1.default.connection.on('disconnected', () => {
            logger_1.logger.warn('⚠️ MongoDB disconnected');
        });
        mongoose_1.default.connection.on('reconnected', () => {
            logger_1.logger.info('🔄 MongoDB reconnected');
        });
        process.on('SIGINT', () => __awaiter(void 0, void 0, void 0, function* () {
            yield mongoose_1.default.connection.close();
            logger_1.logger.info('🛑 MongoDB connection closed through app termination');
            process.exit(0);
        }));
    }
    catch (error) {
        logger_1.logger.error(`❌ Database connection failed: ${error.message}`);
        process.exit(1);
    }
});
exports.connectDB = connectDB;
