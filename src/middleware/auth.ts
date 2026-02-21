import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';
import { User } from '../utils/model/user';

// Define the payload structure expected from the token
interface JwtPayload {
  userId: string;
}

// Optional: define a better type for the user (replace with your User model interface)
interface AuthenticatedRequest extends Request {
  user?: any; // Replace `any` with your actual User type (e.g., `IUser`)
}

// Extend Express's Request interface globally
declare global {
  namespace Express {
    interface Request {
      user?: any; // Replace `any` with your actual User type
    }
  }
}

export const auth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'No token, authorization denied',
      });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback-secret'
    ) as JwtPayload;

const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Token is not valid',
      });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({
        success: false,
        error: 'Account is deactivated',
      });
      return;
    }

    req.user = user;
    next();
  } catch (error: any) {
    logger?.error?.('Auth middleware error:', error); // Optional chaining for safety
    res.status(401).json({
      success: false,
      error: 'Token is not valid',
    });
  }
};


