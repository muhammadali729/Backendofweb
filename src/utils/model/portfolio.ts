import mongoose, { Document, Schema } from 'mongoose';

export interface IPortfolio extends Document {
  title: string;
  description: string;
  shortDescription: string;
  category: string;
  technologies: string[];
  client: string;
  duration: string;
  budget: string;
  image: string;
  images: string[];
  videoUrl?: string;
  liveUrl?: string;
  githubUrl?: string;
  features: string[];
  challenges: string[];
  solutions: string[];
  results: string[];
  testimonial?: {
    text: string;
    author: string;
    position: string;
    company: string;
  };
  isFeatured: boolean;
  isPublished: boolean;
  order: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const portfolioSchema = new Schema<IPortfolio>({
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

export const Portfolio = mongoose.model<IPortfolio>('Portfolio', portfolioSchema); 
