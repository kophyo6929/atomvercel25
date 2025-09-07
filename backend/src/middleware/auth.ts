import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    isAdmin: boolean;
  };
  prisma: PrismaClient | null;
  dbConnected: boolean;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.authToken || req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    let user;
    
    if (req.dbConnected && req.prisma) {
      user = await req.prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, username: true, isAdmin: true, banned: true }
      });
    } else {
      // Fallback approach - import fallback users
      const { fallbackUsers } = require('../controllers/fallbackData');
      user = fallbackUsers.find((u: any) => u.id === decoded.userId);
      if (user) {
        user = {
          id: user.id,
          username: user.username,
          isAdmin: user.isAdmin,
          banned: user.banned
        };
      }
    }

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (user.banned) {
      return res.status(403).json({ error: 'Account is banned' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};