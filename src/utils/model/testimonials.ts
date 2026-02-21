import mongoose, { Document, Schema } from 'mongoose';

export interface ITestimonial extends Document {
  name: string;
  position: string;
  company: string;
  avatar?: string;
  rating: number;
  content: string;
  service: string;
  project?: string;
  isVerified: boolean;
  isFeatured: boolean;
  isPublished: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const testimonialSchema = new Schema<ITestimonial>({
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

export const Testimonial = mongoose.model<ITestimonial>('Testimonial', testimonialSchema); 
