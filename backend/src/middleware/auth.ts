import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../utils/jwt';
import User, { IUser } from '../models/User';

// Extend Request interface to include user
export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

// Protect routes - authentication required
export const protect = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token: string | undefined;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Check for token in cookies
  else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Not authorized to access this route - No token provided'
    });
    return;
  }

  try {
    // Verify token
    const decoded: JWTPayload = verifyToken(token);

    // Get user from token
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Not authorized to access this route - User not found'
      });
      return;
    }

    // Check if user is active
    if (!user.isEmailVerified && process.env.NODE_ENV === 'production') {
      res.status(401).json({
        success: false,
        error: 'Please verify your email to access this resource'
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      error: 'Not authorized to access this route - Invalid token'
    });
    return;
  }
};

// Grant access to specific roles
export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `User role '${req.user.role}' is not authorized to access this route`
      });
      return;
    }

    next();
  };
};

// Check if user is owner of resource or admin
export const isOwnerOrAdmin = (resourceUserId: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
      return;
    }

    const isOwner = req.user.id === resourceUserId;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      res.status(403).json({
        success: false,
        error: 'Not authorized to access this resource'
      });
      return;
    }

    next();
  };
};