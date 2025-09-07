import express, { Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { AuthRequest, authenticateToken } from '../middleware/auth';
import { fallbackUsers } from '../controllers/fallbackData';

const router = express.Router();
const JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRE: string = process.env.JWT_EXPIRE || '7d';

// Register
router.post('/register', [
  body('username').trim().isLength({ min: 3, max: 20 }).withMessage('Username must be 3-20 characters'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('securityAmount').isInt({ min: 0 }).withMessage('Security amount must be a positive number')
], async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password, securityAmount } = req.body;

  try {
    let user;
    
    if (req.dbConnected && req.prisma) {
      // Database approach
      const existingUser = await req.prisma.user.findUnique({
        where: { username: username.toLowerCase() }
      });

      if (existingUser) {
        if (existingUser.banned) {
          return res.status(403).json({ error: 'Username is banned' });
        }
        return res.status(400).json({ error: 'Username already taken' });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      user = await req.prisma.user.create({
        data: {
          username: username.toLowerCase(),
          password: hashedPassword,
          securityAmount: parseInt(securityAmount),
          notifications: ['Welcome to Atom Point Web!']
        },
        select: {
          id: true,
          username: true,
          isAdmin: true,
          credits: true,
          notifications: true
        }
      });
    } else {
      // Fallback approach
      const existingUser = fallbackUsers.find(u => u.username === username.toLowerCase());
      if (existingUser) {
        return res.status(400).json({ error: 'Username already taken' });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const newUser = {
        id: Math.floor(100000 + Math.random() * 900000),
        username: username.toLowerCase(),
        password: hashedPassword,
        isAdmin: false,
        credits: 0,
        securityAmount: parseInt(securityAmount),
        banned: false,
        notifications: ['Welcome to Atom Point Web! (Demo Mode)'],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      fallbackUsers.push(newUser);
      
      // Return user for response
      user = {
        id: newUser.id,
        username: newUser.username,
        isAdmin: newUser.isAdmin,
        credits: newUser.credits,
        notifications: newUser.notifications
      };
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE } as SignOptions
    );

    // Set cookie
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      message: `Registration successful! Your ID is ${user.id}`,
      user
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;

  try {
    let user;
    
    if (req.dbConnected && req.prisma) {
      user = await req.prisma.user.findUnique({
        where: { username: username.toLowerCase() }
      });
    } else {
      user = fallbackUsers.find(u => u.username === username.toLowerCase());
    }

    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.banned) {
      return res.status(403).json({ error: 'Account is banned' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE } as SignOptions
    );

    // Set cookie
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin,
        credits: user.credits,
        notifications: user.notifications
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('authToken');
  res.json({ message: 'Logged out successfully' });
});

// Get current user
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    let user;
    
    if (req.dbConnected && req.prisma) {
      user = await req.prisma.user.findUnique({
        where: { id: req.user!.id },
        select: {
          id: true,
          username: true,
          isAdmin: true,
          credits: true,
          notifications: true,
          banned: true
        }
      });
    } else {
      // Fallback approach
      user = fallbackUsers.find(u => u.id === req.user!.id);
      if (user) {
        user = {
          id: user.id,
          username: user.username,
          isAdmin: user.isAdmin,
          credits: user.credits,
          notifications: user.notifications,
          banned: user.banned
        };
      }
    }

    if (!user || user.banned) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

// Reset password
router.post('/reset-password', [
  body('userId').isInt().withMessage('Valid user ID required'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { userId, newPassword } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    if (!req.prisma) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    await req.prisma.user.update({
      where: { id: parseInt(userId) },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Password reset failed' });
  }
});

export default router;