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
exports.Contact = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const contactSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
        maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        lowercase: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email',
        ],
    },
    phone: {
        type: String,
        match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please provide a valid phone number'],
    },
    service: {
        type: String,
        required: [true, 'Please select a service'],
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
    message: {
        type: String,
        required: [true, 'Please provide a message'],
        maxlength: [2000, 'Message cannot be more than 2000 characters'],
    },
    status: {
        type: String,
        enum: ['new', 'contacted', 'qualified', 'converted', 'lost'],
        default: 'new',
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
    },
    source: {
        type: String,
        enum: ['website', 'chatbot', 'referral', 'social', 'other'],
        default: 'website',
    },
    assignedTo: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    notes: {
        type: String,
        maxlength: [1000, 'Notes cannot be more than 1000 characters'],
    },
    followUpDate: {
        type: Date,
    },
    tags: [{
            type: String,
            trim: true,
        }],
}, {
    timestamps: true,
});
// Indexes for better query performance
contactSchema.index({ email: 1 });
contactSchema.index({ status: 1 });
contactSchema.index({ service: 1 });
contactSchema.index({ createdAt: -1 });
contactSchema.index({ assignedTo: 1 });
contactSchema.index({ followUpDate: 1 });
// Virtual for time since creation
contactSchema.virtual('timeSinceCreation').get(function () {
    return Date.now() - this.createdAt.getTime();
});
// Pre-save middleware to set priority based on service
contactSchema.pre('save', function (next) {
    if (this.isModified('service')) {
        const highPriorityServices = ['amazon', 'saas', 'crm'];
        const lowPriorityServices = ['design', 'other'];
        if (highPriorityServices.includes(this.service)) {
            this.priority = 'high';
        }
        else if (lowPriorityServices.includes(this.service)) {
            this.priority = 'low';
        }
        else {
            this.priority = 'medium';
        }
    }
    next();
});
exports.Contact = mongoose_1.default.model('Contact', contactSchema);
