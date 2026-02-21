import express from 'express';

import { Testimonial } from '../model/testimonials';
import { logger } from '../logger';
import { auth } from '../../middleware/auth';

const router = express.Router();
const { validationResult } = require("express-validator");
const { body } = require("express-validator");

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const service = req.query.service as string;
    const featured = req.query.featured === 'true';

    const query: any = { isPublished: true };

    if (service) query.service = service;
    if (featured) query.isFeatured = true;

    const skip = (page - 1) * limit;

    const testimonials = await Testimonial.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Testimonial.countDocuments(query);

    res.json({
      success: true,
      data: testimonials,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    logger.error('Get testimonials error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

router.get('/featured', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 6;

    const testimonials = await Testimonial.find({
      isFeatured: true,
      isPublished: true,
    })
      .sort({ order: 1, rating: -1 })
      .limit(limit);

    res.json({
      success: true,
      data: testimonials,
    });

  } catch (error) {
    logger.error('Get featured testimonials error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

router.post('/', auth, [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('position')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Position must be between 2 and 100 characters'),
  body('company')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('content')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Content must be between 10 and 1000 characters'),
  body('service')
    .isIn(['amazon', 'website', 'mobile', 'design', 'chatbot', 'crm', 'saas', 'other'])
    .withMessage('Please select a valid service'),
], async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array(),
      });
      return;
    }

    // Check if user is admin
    if (req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Access denied',
      });
      return;
    }

    const testimonial = new Testimonial(req.body);
    await testimonial.save();

    res.status(201).json({
      success: true,
      message: 'Testimonial created successfully',
      data: testimonial,
    });

  } catch (error) {
    logger.error('Create testimonial error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

export default router; 