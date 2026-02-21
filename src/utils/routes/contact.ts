import express, { Request, Response } from 'express';
import { Contact } from '../model/contact';
import { sendEmail } from '../email';
import { logger } from '../logger';
import { auth } from '../../middleware/auth';
import { IUser } from '../model/user';

const router = express.Router();
const { validationResult } = require("express-validator");
const { body } = require("express-validator");

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: IUser;
}

router.post('/', [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('service')
    .isIn(['amazon', 'website', 'mobile', 'design', 'chatbot', 'crm', 'saas', 'other'])
    .withMessage('Please select a valid service'),
  body('message')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters'),
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

    const { name, email, phone, service, message } = req.body;

    // Create contact entry
    const contact = new Contact({
      name,
      email,
      phone,
      service,
      message,
      source: 'website',
    });

    await contact.save();

    // Send notification email to admin
    await sendEmail({
      to: process.env.EMAIL_FROM || 'admin@techdev.inc',
      subject: 'New Contact Form Submission',
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
        <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
      `,
    });

    // Send confirmation email to user
    await sendEmail({
      to: email,
      subject: 'Thank you for contacting TechDev.inc',
      html: `
        <h1>Thank you for reaching out!</h1>
        <p>Hi ${name},</p>
        <p>We've received your message and will get back to you within 24 hours.</p>
        <p><strong>Your message:</strong></p>
        <p>${message}</p>
        <p>Best regards,<br>The TechDev.inc Team</p>
      `,
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your message. We will get back to you soon!',
      contact: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        service: contact.service,
        status: contact.status,
      },
    });

  } catch (error) {
    logger.error('Contact submission error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

// @route   GET /api/contact
// @desc    Get all contacts (admin only)
// @access  Private
router.get('/', auth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Access denied',
      });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const service = req.query.service as string;
    const search = req.query.search as string;

    const query: any = {};

    if (status) query.status = status;
    if (service) query.service = service;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('assignedTo', 'name email');

    const total = await Contact.countDocuments(query);

    res.json({
      success: true,
      data: contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    logger.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

// @route   GET /api/contact/:id
// @desc    Get contact by ID (admin only)
// @access  Private
router.get('/:id', auth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Access denied',
      });
      return;
    }

    const contact = await Contact.findById(req.params.id)
      .populate('assignedTo', 'name email');

    if (!contact) {
      res.status(404).json({
        success: false,
        error: 'Contact not found',
      });
      return;
    }

    res.json({
      success: true,
      data: contact,
    });

  } catch (error) {
    logger.error('Get contact error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

// @route   PUT /api/contact/:id
// @desc    Update contact (admin only)
// @access  Private
router.put('/:id', auth, [
  body('status')
    .optional()
    .isIn(['new', 'contacted', 'qualified', 'converted', 'lost'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot be more than 1000 characters'),
  body('followUpDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
], async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
    if (req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Access denied',
      });
      return;
    }

    const { status, priority, notes, followUpDate, assignedTo } = req.body;

    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      res.status(404).json({
        success: false,
        error: 'Contact not found',
      });
      return;
    }

    // Update fields
    if (status) contact.status = status;
    if (priority) contact.priority = priority;
    if (notes !== undefined) contact.notes = notes;
    if (followUpDate) contact.followUpDate = new Date(followUpDate);
    if (assignedTo) contact.assignedTo = assignedTo;

    await contact.save();

    res.json({
      success: true,
      message: 'Contact updated successfully',
      data: contact,
    });

  } catch (error) {
    logger.error('Update contact error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

// @route   DELETE /api/contact/:id
// @desc    Delete contact (admin only)
// @access  Private
router.delete('/:id', auth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Access denied',
      });
      return;
    }

    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      res.status(404).json({
        success: false,
        error: 'Contact not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Contact deleted successfully',
    });

  } catch (error) {
    logger.error('Delete contact error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

// @route   GET /api/contact/stats/summary
// @desc    Get contact statistics (admin only)
// @access  Private
router.get('/stats/summary', auth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Access denied',
      });
      return;
    }

    const totalContacts = await Contact.countDocuments();
    const newContacts = await Contact.countDocuments({ status: 'new' });
    const contactedContacts = await Contact.countDocuments({ status: 'contacted' });
    const qualifiedContacts = await Contact.countDocuments({ status: 'qualified' });
    const convertedContacts = await Contact.countDocuments({ status: 'converted' });

    // Get contacts by service
    const serviceStats = await Contact.aggregate([
      {
        $group: {
          _id: '$service',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get contacts by source
    const sourceStats = await Contact.aggregate([
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        total: totalContacts,
        byStatus: {
          new: newContacts,
          contacted: contactedContacts,
          qualified: qualifiedContacts,
          converted: convertedContacts,
        },
        byService: serviceStats,
        bySource: sourceStats,
      },
    });

  } catch (error) {
    logger.error('Get contact stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

export default router; 