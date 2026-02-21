import { Request, Response } from 'express';
import { Contact } from '../model/contact';
import { Portfolio } from '../model/portfolio';
import { Testimonial } from '../model/testimonials';
import { User } from '../model/user';
import { logger } from '../logger';
import { auth } from '../../middleware/auth';

import express from 'express';
const router = express.Router();
router.get('/dashboard', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    // Get counts
    const totalContacts = await Contact.countDocuments();
    const newContacts = await Contact.countDocuments({ status: 'new' });
    const totalPortfolio = await Portfolio.countDocuments();
    const publishedPortfolio = await Portfolio.countDocuments({ isPublished: true });
    const totalTestimonials = await Testimonial.countDocuments();
    const publishedTestimonials = await Testimonial.countDocuments({ isPublished: true });
    const totalUsers = await User.countDocuments();

    // Get contacts by source
    const contactsBySource = await Contact.aggregate([
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get contacts by service
    const contactsByService = await Contact.aggregate([
      {
        $group: {
          _id: '$service',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get recent contacts
    const recentContacts = await Contact.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email service status createdAt');

    // Get portfolio by category
    const portfolioByCategory = await Portfolio.aggregate([
      { $match: { isPublished: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        counts: {
          contacts: totalContacts,
          newContacts,
          portfolio: totalPortfolio,
          publishedPortfolio,
          testimonials: totalTestimonials,
          publishedTestimonials,
          users: totalUsers,
        },
        contactsBySource,
        contactsByService,
        portfolioByCategory,
        recentContacts,
      },
    });

  } catch (error) {
    logger.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

export default router; 