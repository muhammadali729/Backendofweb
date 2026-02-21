import mongoose, { Document, Schema } from 'mongoose';

export interface IContact extends Document {
  name: string;
  email: string;
  phone?: string;
  service: string;
  message: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  priority: 'low' | 'medium' | 'high';
  source: 'website' | 'chatbot' | 'referral' | 'social' | 'other';
  assignedTo?: mongoose.Types.ObjectId;
  notes?: string;
  followUpDate?: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const contactSchema = new Schema<IContact>({
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
    type: Schema.Types.ObjectId,
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
contactSchema.virtual('timeSinceCreation').get(function() {
  return Date.now() - this.createdAt.getTime();
});

// Pre-save middleware to set priority based on service
contactSchema.pre('save', function(next) {
  if (this.isModified('service')) {
    const highPriorityServices = ['amazon', 'saas', 'crm'];
    const lowPriorityServices = ['design', 'other'];
    
    if (highPriorityServices.includes(this.service)) {
      this.priority = 'high';
    } else if (lowPriorityServices.includes(this.service)) {
      this.priority = 'low';
    } else {
      this.priority = 'medium';
    }
  }
  next();
});

export const Contact = mongoose.model<IContact>('Contact', contactSchema); 
