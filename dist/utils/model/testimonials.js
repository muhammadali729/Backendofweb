"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Testimonial = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const testimonialSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
        maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    position: {
        type: String,
        required: [true, 'Please provide a position'],
        trim: true,
        maxlength: [100, 'Position cannot be more than 100 characters'],
    },
    company: {
        type: String,
        required: [true, 'Please provide a company name'],
        trim: true,
        maxlength: [100, 'Company name cannot be more than 100 characters'],
    },
    avatar: {
        type: String,
    },
    rating: {
        type: Number,
        required: [true, 'Please provide a rating'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot be more than 5'],
    },
    content: {
        type: String,
        required: [true, 'Please provide testimonial content'],
        maxlength: [1000, 'Content cannot be more than 1000 characters'],
    },
    service: {
        type: String,
        required: [true, 'Please provide the service used'],
        enum: [
            'amazon',
            'website',
            'mobile',
            'design',
            'chatbot',
            'crm',
            'saas',
            'other'
        ],
    },
    project: {
        type: String,
        trim: true,
        maxlength: [200, 'Project name cannot be more than 200 characters'],
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    isPublished: {
        type: Boolean,
        default: true,
    },
    order: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});
// Indexes for better query performance
testimonialSchema.index({ service: 1 });
testimonialSchema.index({ rating: -1 });
testimonialSchema.index({ isFeatured: 1 });
testimonialSchema.index({ isPublished: 1 });
testimonialSchema.index({ order: 1 });
testimonialSchema.index({ createdAt: -1 });
exports.Testimonial = mongoose_1.default.model('Testimonial', testimonialSchema);
