import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types/auth/AuthenticatedRequest.interface';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const verifyToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
      return res.status(401).json({ error: 'Access denied, no token provided' });
    }
    
    try {
      // TODO CHECK TOKEN DURATION, dont think its done here
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
