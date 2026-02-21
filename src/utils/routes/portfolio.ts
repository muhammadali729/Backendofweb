import express, { Request, Response } from 'express';
const { validationResult } = require("express-validator");
const { body } = require("express-validator");
import { Portfolio } from '../model/portfolio';
import { logger } from '../logger';
import { auth } from '../../middleware/auth';

const router = express.Router();

// @route   GET /api/portfolio
// @desc    Get all portfolio projects
// @access  Public
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const category = req.query.category as string;
    const featured = req.query.featured === 'true';
    const search = req.query.search as string;

    const query: any = { isPublished: true };

    if (category) query.category = category;
    if (featured) query.isFeatured = true;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { client: { $regex: search, $options: 'i' } },
        { technologies: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const skip = (page - 1) * limit;

    const projects = await Portfolio.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Portfolio.countDocuments(query);

    res.json({
      success: true,
      data: projects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    logger.error('Get portfolio error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

// @route   GET /api/portfolio/categories
// @desc    Get all portfolio categories
// @access  Public
router.get('/categories', async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Portfolio.aggregate([
      { $match: { isPublished: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: categories,
    });

  } catch (error) {
    logger.error('Get portfolio categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

// @route   GET /api/portfolio/featured
// @desc    Get featured portfolio projects
// @access  Public
router.get('/featured', async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 6;

    const projects = await Portfolio.find({
      isFeatured: true,
      isPublished: true,
    })
      .sort({ order: 1, createdAt: -1 })
      .limit(limit);

    res.json({
      success: true,
      data: projects,
    });

  } catch (error) {
    logger.error('Get featured portfolio error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

// @route   GET /api/portfolio/:id
// @desc    Get single portfolio project
// @access  Public
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const project = await Portfolio.findById(req.params.id);

    if (!project || !project.isPublished) {
      res.status(404).json({
        success: false,
        error: 'Project not found',
      });
      return;
    }

    res.json({
      success: true,
      data: project,
    });

  } catch (error) {
    logger.error('Get portfolio project error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

// @route   POST /api/portfolio
// @desc    Create new portfolio project (admin only)
// @access  Private
router.post('/', auth, [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('shortDescription')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Short description must be between 10 and 200 characters'),
  body('category')
    .isIn(['website', 'mobile-app', 'ecommerce', 'saas', 'chatbot', 'crm', 'design', 'amazon-management', 'other'])
    .withMessage('Please select a valid category'),
  body('client')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Client name must be between 2 and 100 characters'),
  body('duration')
    .trim()
    .notEmpty()
    .withMessage('Duration is required'),
  body('budget')
    .trim()
    .notEmpty()
    .withMessage('Budget is required'),
  body('image')
    .notEmpty()
    .withMessage('Main image is required'),
], async (req: Request, res: Response): Promise<void> => {
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
    if ((req as any).user.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Access denied',
      });
      return;
    }

    const project = new Portfolio(req.body);
    await project.save();

    res.status(201).json({
      success: true,
      message: 'Portfolio project created successfully',
      data: project,
    });

  } catch (error) {
    logger.error('Create portfolio error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

// @route   PUT /api/portfolio/:id
// @desc    Update portfolio project (admin only)
// @access  Private
router.put('/:id', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if user is admin
    if ((req as any).user.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Access denied',
      });
      return;
    }

    const project = await Portfolio.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!project) {
      res.status(404).json({
        success: false,
        error: 'Project not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Portfolio project updated successfully',
      data: project,
    });

  } catch (error) {
    logger.error('Update portfolio error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

// @route   DELETE /api/portfolio/:id
// @desc    Delete portfolio project (admin only)
// @access  Private
router.delete('/:id', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if user is admin
    if ((req as any).user.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Access denied',
      });
      return;
    }

    const project = await Portfolio.findByIdAndDelete(req.params.id);

    if (!project) {
      res.status(404).json({
        success: false,
        error: 'Project not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Portfolio project deleted successfully',
    });

  } catch (error) {
    logger.error('Delete portfolio error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

export default router; 