import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.ts';
import { UnauthorizedError } from '../utils/errors.ts';

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const authenticate = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Authentication required. Missing Bearer token.'));
  }

  const token = authHeader.substring(7).trim();

  if (!token) {
    return next(new UnauthorizedError('Invalid token format.'));
  }

  try {
    const decoded = verifyToken(token);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return next(new UnauthorizedError('Invalid or expired authentication token.'));
  }
};
