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
exports.Portfolio = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const portfolioSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
        type: String,
        required: [true, 'Please provide a description'],
        maxlength: [2000, 'Description cannot be more than 2000 characters'],
    },
    shortDescription: {
        type: String,
        required: [true, 'Please provide a short description'],
        maxlength: [200, 'Short description cannot be more than 200 characters'],
    },
    category: {
        type: String,
        required: [true, 'Please provide a category'],
        enum: [
            'website',
            'mobile-app',
            'ecommerce',
            'saas',
            'chatbot',
            'crm',
            'design',
            'amazon-management',
            'other'
        ],
    },
    technologies: [{
            type: String,
            trim: true,
        }],
    client: {
        type: String,
        required: [true, 'Please provide a client name'],
        trim: true,
    },
    duration: {
        type: String,
        required: [true, 'Please provide project duration'],
        trim: true,
    },
    budget: {
        type: String,
        required: [true, 'Please provide project budget'],
        trim: true,
    },
    image: {
        type: String,
        required: [true, 'Please provide a main image'],
    },
    images: [{
            type: String,
        }],
    videoUrl: {
        type: String,
        match: [/^https?:\/\/.+/, 'Please provide a valid URL'],
    },
    liveUrl: {
        type: String,
        match: [/^https?:\/\/.+/, 'Please provide a valid URL'],
    },
    githubUrl: {
        type: String,
        match: [/^https?:\/\/.+/, 'Please provide a valid URL'],
    },
    features: [{
            type: String,
            trim: true,
        }],
    challenges: [{
            type: String,
            trim: true,
        }],
    solutions: [{
            type: String,
            trim: true,
        }],
    results: [{
            type: String,
            trim: true,
        }],
    testimonial: {
        text: {
            type: String,
            trim: true,
        },
        author: {
            type: String,
            trim: true,
        },
        position: {
            type: String,
            trim: true,
        },
        company: {
            type: String,
            trim: true,
        },
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
    tags: [{
            type: String,
            trim: true,
        }],
}, {
    timestamps: true,
});
// Indexes for better query performance
portfolioSchema.index({ category: 1 });
portfolioSchema.index({ isFeatured: 1 });
portfolioSchema.index({ isPublished: 1 });
portfolioSchema.index({ order: 1 });
portfolioSchema.index({ tags: 1 });
portfolioSchema.index({ createdAt: -1 });
exports.Portfolio = mongoose_1.default.model('Portfolio', portfolioSchema);
