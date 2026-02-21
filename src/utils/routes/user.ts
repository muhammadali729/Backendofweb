import express, { Request, Response, Router } from 'express';
import { User } from '../model/user';
import { logger } from '../logger';
import { auth } from '../../middleware/auth';

const router: Router = express.Router();

// @route   GET /api/
// @desc    Auth test route
// @access  Private
router.get('/', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({ success: true, message: 'Authenticated Route Hit' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   GET /api/users
// @desc    Get all users
// @access  Public (you can apply `auth` if you want)
router.get('/users', async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    logger.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

export default router;
