import express from 'express';
import { AuthRequest, authenticateToken } from '../middleware/auth';
import { fallbackUsers } from '../controllers/fallbackData';

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req: AuthRequest, res) => {
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
          createdAt: true,
          _count: {
            select: { orders: true }
          }
        }
      });
    } else {
      // Fallback approach
      const fallbackUser = fallbackUsers.find(u => u.id === req.user!.id);
      if (fallbackUser) {
        user = {
          id: fallbackUser.id,
          username: fallbackUser.username,
          isAdmin: fallbackUser.isAdmin,
          credits: fallbackUser.credits,
          notifications: fallbackUser.notifications,
          createdAt: fallbackUser.createdAt,
          _count: { orders: 0 } // Simplified for fallback
        };
      }
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Clear user notifications
router.post('/clear-notifications', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.dbConnected && req.prisma) {
      await req.prisma.user.update({
        where: { id: req.user!.id },
        data: { notifications: [] }
      });
    } else {
      // Fallback approach
      const user = fallbackUsers.find((u: any) => u.id === req.user!.id);
      if (user) {
        user.notifications = [];
      }
    }

    res.json({ message: 'Notifications cleared' });
  } catch (error) {
    console.error('Clear notifications error:', error);
    res.status(500).json({ error: 'Failed to clear notifications' });
  }
});

// Get settings
router.get('/settings', async (req: AuthRequest, res) => {
  try {
    let settingsMap = {};
    let paymentDetails = {};
    
    if (req.dbConnected && req.prisma) {
      const settings = await req.prisma.setting.findMany();
      const paymentAccounts = await req.prisma.paymentAccount.findMany({
        where: { active: true }
      });

      settingsMap = settings.reduce((acc: any, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});

      paymentDetails = paymentAccounts.reduce((acc: any, account) => {
        acc[account.provider] = {
          name: account.name,
          number: account.number
        };
        return acc;
      }, {});
    } else {
      // Fallback approach
      const { fallbackPaymentDetails, fallbackSettings } = require('../controllers/fallbackData');
      settingsMap = fallbackSettings;
      paymentDetails = fallbackPaymentDetails;
    }

    res.json({
      settings: settingsMap,
      paymentDetails,
      adminContact: (settingsMap as any).adminContact || 'https://t.me/CEO_METAVERSE'
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

export default router;