import express from 'express';
import { Contact } from '../model/contact';
import { logger } from '../logger';

const router = express.Router();
const { validationResult } = require("express-validator");
const { body } = require("express-validator");

const getAIResponse = (userInput: string): string => {
  const input = userInput.toLowerCase();
  
  if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
    return "Hello! Welcome to TechDev.inc. We specialize in Amazon A-Z management, web development, mobile apps, and more. What can I help you with today?";
  }
  
  if (input.includes('amazon') || input.includes('ecommerce') || input.includes('store')) {
    return "Great! Our Amazon A-Z Management service includes product research, listing optimization, inventory management, and PPC advertising. We've helped clients scale from $10K to $100K monthly revenue. Would you like to know more about our pricing?";
  }
  
  if (input.includes('website') || input.includes('web development') || input.includes('site')) {
    return "Our web development services include responsive design, SEO optimization, CMS integration, and e-commerce platforms. We create stunning websites that convert visitors into customers. What type of website are you looking for?";
  }
  
  if (input.includes('mobile') || input.includes('app') || input.includes('ios') || input.includes('android')) {
    return "We develop native and cross-platform mobile apps for iOS and Android. Our apps are user-friendly, fast, and designed to drive engagement. Are you looking to build a new app or improve an existing one?";
  }
  
  if (input.includes('price') || input.includes('cost') || input.includes('pricing')) {
    return "Our pricing starts at $299 for our Starter package, $699/month for Professional, and we offer custom Enterprise solutions. Each plan includes different services. Would you like me to explain what's included in each plan?";
  }
  
  if (input.includes('chatbot') || input.includes('ai') || input.includes('automation')) {
    return "Our AI chatbots can handle customer support, lead generation, and process automation 24/7. They integrate with your website, CRM, and other systems. Perfect for improving customer service while saving time!";
  }
  
  if (input.includes('crm') || input.includes('customer management')) {
    return "We build custom CRM systems tailored to your workflow. Features include contact management, sales tracking, analytics, and team collaboration. It's perfect for managing customer relationships and boosting productivity.";
  }
  
  if (input.includes('saas') || input.includes('software')) {
    return "Our SaaS development includes cloud architecture, multi-tenant systems, subscription billing, and secure APIs. We help you launch scalable software-as-a-service platforms. What kind of SaaS are you planning to build?";
  }
  
  if (input.includes('design') || input.includes('graphics') || input.includes('logo')) {
    return "Our design services cover logos, brand identity, UI/UX design, and marketing materials. We create visually stunning designs that communicate your brand message effectively. What design work do you need?";
  }
  
  if (input.includes('contact') || input.includes('get in touch')) {
    return "You can reach us at support@techdev.inc or call +1 (234) 567-8900. Our office is in Chicago, IL. We respond to emails within 24 hours and offer free consultations!";
  }
  
  if (input.includes('time') || input.includes('how long') || input.includes('duration')) {
    return "Project timelines vary based on complexity. Simple websites take 2-3 weeks, mobile apps 6-12 weeks, and custom software 3-6 months. We always provide detailed timelines during our initial consultation.";
  }
  
  if (input.includes('portfolio') || input.includes('examples') || input.includes('work')) {
    return "Check out our portfolio! We've worked on projects like Buff Body Butlers (WordPress site), CloserBabes (web app), and various Amazon stores. Each project showcases our expertise across different industries.";
  }
  
  if (input.includes('team') || input.includes('who are you') || input.includes('company')) {
    return "TechDev.inc is a passionate team of developers, designers, and strategists with 8+ years of experience. We've completed 1000+ projects for 500+ happy clients and won 25+ awards for our work.";
  }
  
  if (input.includes('thank') || input.includes('thanks')) {
    return "You're welcome! I'm here to help. Feel free to ask me anything about our services, pricing, or how we can help grow your business. Is there anything else you'd like to know?";
  }
  
  return "That's a great question! Our team specializes in Amazon management, web development, mobile apps, AI chatbots, CRM systems, and SaaS development. Could you tell me more about your specific needs so I can provide better guidance?";
};

// @route   POST /api/chatbot/message
// @desc    Send message to chatbot
// @access  Public
router.post('/message', [
  body('message')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Message must be between 1 and 500 characters'),
  body('sessionId')
    .optional()
    .isString()
    .withMessage('Session ID must be a string'),
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

    const { message, sessionId, userInfo } = req.body;

    // Get AI response
    const aiResponse = getAIResponse(message);

    // Log conversation for analytics
    logger.info('Chatbot conversation', {
      sessionId,
      userMessage: message,
      aiResponse,
      userInfo,
      timestamp: new Date().toISOString(),
    });

    // Check if user wants to contact us
    const wantsContact = message.toLowerCase().includes('contact') || 
                        message.toLowerCase().includes('get in touch') ||
                        message.toLowerCase().includes('call') ||
                        message.toLowerCase().includes('email');

    res.json({
      success: true,
      response: aiResponse,
      sessionId: sessionId || `session_${Date.now()}`,
      wantsContact,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('Chatbot message error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

// @route   POST /api/chatbot/contact
// @desc    Create contact from chatbot conversation
// @access  Public
router.post('/contact', [
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
  body('sessionId')
    .optional()
    .isString()
    .withMessage('Session ID must be a string'),
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

    const { name, email, phone, service, message, sessionId } = req.body;

    // Create contact entry
    const contact = new Contact({
      name,
      email,
      phone,
      service,
      message,
      source: 'chatbot',
      tags: ['chatbot-lead'],
    });

    await contact.save();

    // Log the contact creation
    logger.info('Chatbot contact created', {
      sessionId,
      contactId: contact._id,
      name,
      email,
      service,
      timestamp: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your interest! We will contact you soon.',
      contact: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        service: contact.service,
        status: contact.status,
      },
    });

  } catch (error) {
    logger.error('Chatbot contact error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

// @route   GET /api/chatbot/stats
// @desc    Get chatbot statistics (admin only)
// @access  Private
router.get('/stats', async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    // Get chatbot contacts
    const chatbotContacts = await Contact.countDocuments({ source: 'chatbot' });
    
    // Get chatbot contacts by service
    const serviceStats = await Contact.aggregate([
      { $match: { source: 'chatbot' } },
      {
        $group: {
          _id: '$service',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get chatbot contacts by status
    const statusStats = await Contact.aggregate([
      { $match: { source: 'chatbot' } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        totalContacts: chatbotContacts,
        byService: serviceStats,
        byStatus: statusStats,
      },
    });

  } catch (error) {
    logger.error('Get chatbot stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

export default router; 
