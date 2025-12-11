import jwt, { SignOptions } from 'jsonwebtoken';
import { Response } from 'express';

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
}

// Generate JWT Token
export const generateToken = (payload: JWTPayload): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.sign(payload as object, secret, { expiresIn: '7d' });
};

// Verify JWT Token
export const verifyToken = (token: string): JWTPayload => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  try {
    const decoded = jwt.verify(token, secret) as JWTPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw new Error('Token verification failed');
  }
};

// Send token response
export const sendTokenResponse = (
  user: any,
  statusCode: number,
  res: Response
): void => {
  // Create token
  const token = generateToken({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  // Cookie options
  const options = {
    expires: new Date(
      Date.now() + (parseInt(process.env.JWT_COOKIE_EXPIRE || '7') * 24 * 60 * 60 * 1000)
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
      },
    });
};