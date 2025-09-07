import express, { Response } from 'express';
import { AuthRequest, authenticateToken, requireAdmin } from '../middleware/auth';
import { fallbackUsers, fallbackOrders } from '../controllers/fallbackData';

const router = express.Router();

// Get all users (admin only)
router.get('/users', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    let users;
    
    if (req.dbConnected && req.prisma) {
      users = await req.prisma.user.findMany({
        select: {
          id: true,
          username: true,
          isAdmin: true,
          credits: true,
          banned: true,
          createdAt: true,
          _count: {
            select: { orders: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      // Fallback approach
      users = fallbackUsers.map(user => ({
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin,
        credits: user.credits,
        banned: user.banned,
        createdAt: user.createdAt,
        _count: { orders: 0 } // Simplified for fallback
      })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get all orders (admin only)
router.get('/orders', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    let orders;
    
    if (req.dbConnected && req.prisma) {
      const dbOrders = await req.prisma.order.findMany({
        include: {
          user: {
            select: { username: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Get product details for product orders
      const productCache: any = {};
      const productOrders = dbOrders.filter(o => o.type === 'PRODUCT');
      
      for (const order of productOrders) {
        if (order.productId && !productCache[order.productId]) {
          try {
            const product = await req.prisma.product.findUnique({
              where: { id: order.productId }
            });
            if (product) {
              productCache[order.productId] = product;
            }
          } catch (e) {
            console.log('Product lookup failed for', order.productId);
          }
        }
      }

      // Transform orders to frontend format
      orders = dbOrders.map((order: any) => {
        const transformedOrder: any = {
          id: order.id.toString(),
          userId: order.userId,
          cost: order.amount,
          date: order.createdAt.toISOString(),
          status: order.status === 'PENDING' ? 'Pending Approval' : 
                 order.status === 'APPROVED' ? 'Completed' : 
                 order.status === 'DECLINED' ? 'Declined' : order.status
        };

        if (order.type === 'CREDIT') {
          transformedOrder.type = 'CREDIT';
          transformedOrder.product = { name: `${order.amount} MMK Credit Purchase` };
          transformedOrder.paymentMethod = 'KPay';
          if (order.proofImage) {
            transformedOrder.paymentProof = order.proofImage;
          }
        } else {
          // Product order - don't set type (frontend expects undefined for products)
          const product = productCache[order.productId];
          transformedOrder.product = {
            name: product ? product.name : `Product ${order.productId}`,
            operator: product ? product.operator : 'Unknown'
          };
          transformedOrder.deliveryInfo = `Order ID: ${order.id}`;
        }

        return transformedOrder;
      });
    } else {
      // Fallback approach
      orders = fallbackOrders.map((order: any) => {
        const user = fallbackUsers.find((u: any) => u.id === order.userId);
        return {
          ...order,
          user: { username: user ? user.username : 'Unknown' }
        };
      }).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    res.json({ orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Update order status (admin only)
router.put('/orders/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    let order: any, updatedOrder: any;
    
    if (req.dbConnected && req.prisma) {
      order = await req.prisma.order.findUnique({
        where: { id: isNaN(parseInt(orderId)) ? 0 : parseInt(orderId) },
        include: { user: true }
      });

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Update order status
      updatedOrder = await req.prisma.order.update({
        where: { id: isNaN(parseInt(orderId)) ? 0 : parseInt(orderId) },
        data: { status }
      });

      // Handle different order types when approved
      if (status === 'APPROVED') {
        if (order.type === 'CREDIT') {
          // Add credits for credit purchase
          const creditAmount = Math.floor(order.amount / 100); // 1 credit per 100 MMK
          
          await req.prisma.user.update({
            where: { id: order.userId },
            data: { 
              credits: { increment: creditAmount },
              notifications: {
                push: `Credit purchase approved! ${creditAmount} credits added to your account.`
              }
            }
          });
        } else if (order.type === 'PRODUCT') {
          // Deduct credits for product purchase
          await req.prisma.user.update({
            where: { id: order.userId },
            data: { 
              credits: { decrement: order.amount },
              notifications: {
                push: `Product order approved! ${order.amount} credits deducted from your account.`
              }
            }
          });
        }
      } else if (status === 'DECLINED' && order.type === 'PRODUCT') {
        // No action needed for declined product orders since credits weren't deducted yet
        await req.prisma.user.update({
          where: { id: order.userId },
          data: { 
            notifications: {
              push: `Product order declined. No credits were charged.`
            }
          }
        });
      }

      // Add notification to user
      const notificationMessage = status === 'APPROVED' 
        ? `Your ${order.type.toLowerCase()} order has been approved!`
        : `Your ${order.type.toLowerCase()} order has been ${status.toLowerCase()}.`;

      await req.prisma.user.update({
        where: { id: order.userId },
        data: {
          notifications: { push: notificationMessage }
        }
      });
    } else {
      // Fallback approach
      order = fallbackOrders.find((o: any) => o.id === orderId);
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Update order status in memory
      order.status = status;
      updatedOrder = order;

      // If approving credit order, add credits to user
      if (status === 'APPROVED' && order.type === 'CREDIT') {
        const creditAmount = Math.floor(order.amount / 100); // 1 credit per 100 MMK
        const user = fallbackUsers.find((u: any) => u.id === order.userId);
        
        if (user) {
          user.credits += creditAmount;
          user.notifications.push(`Credit purchase approved! ${creditAmount} credits added to your account.`);
        }
      }

      // Add notification to user
      const user = fallbackUsers.find((u: any) => u.id === order.userId);
      if (user) {
        const notificationMessage = status === 'APPROVED' 
          ? `Your ${order.type.toLowerCase()} order has been approved!`
          : `Your ${order.type.toLowerCase()} order has been ${status.toLowerCase()}.`;
        user.notifications.push(notificationMessage);
      }
    }

    res.json({ order: updatedOrder, message: `Order ${status.toLowerCase()} successfully` });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// Ban/unban user (admin only)
router.put('/users/:id/ban', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { banned } = req.body;
    const userId = parseInt(req.params.id);

    let user;
    
    if (req.dbConnected && req.prisma) {
      user = await req.prisma.user.update({
        where: { id: userId },
        data: { banned }
      });
    } else {
      // Fallback approach
      user = fallbackUsers.find((u: any) => u.id === userId);
      if (user) {
        user.banned = banned;
      } else {
        return res.status(404).json({ error: 'User not found' });
      }
    }

    res.json({ 
      user, 
      message: banned ? 'User banned successfully' : 'User unbanned successfully' 
    });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ error: 'Failed to update user ban status' });
  }
});

// Adjust user credits (admin only)
router.put('/users/:id/credits', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { amount } = req.body;
    const userId = parseInt(req.params.id);

    if (typeof amount !== 'number') {
      return res.status(400).json({ error: 'Amount must be a number' });
    }

    let user;
    
    if (req.dbConnected && req.prisma) {
      // Database approach
      user = await req.prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Update credits
      user = await req.prisma.user.update({
        where: { id: userId },
        data: { 
          credits: { increment: amount },
          notifications: {
            push: amount > 0 
              ? `✅ Admin added ${amount} credits to your account!`
              : `⚠️ Admin deducted ${Math.abs(amount)} credits from your account.`
          }
        }
      });
    } else {
      // Fallback approach
      user = fallbackUsers.find((u: any) => u.id === userId);
      if (user) {
        user.credits += amount;
        user.notifications.push(
          amount > 0 
            ? `✅ Admin added ${amount} credits to your account!`
            : `⚠️ Admin deducted ${Math.abs(amount)} credits from your account.`
        );
      } else {
        return res.status(404).json({ error: 'User not found' });
      }
    }

    res.json({ 
      user, 
      message: `Credits ${amount > 0 ? 'added' : 'deducted'} successfully` 
    });
  } catch (error) {
    console.error('Adjust credits error:', error);
    res.status(500).json({ error: 'Failed to adjust user credits' });
  }
});

// Purge user data (admin only)
router.delete('/users/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const userId = parseInt(req.params.id);

    if (req.dbConnected && req.prisma) {
      // Database approach - delete user and all their orders
      await req.prisma.$transaction(async (prisma) => {
        // Delete user's orders first
        await prisma.order.deleteMany({
          where: { userId }
        });
        
        // Then delete the user
        await prisma.user.delete({
          where: { id: userId }
        });
      });
    } else {
      // Fallback approach
      const userIndex = fallbackUsers.findIndex((u: any) => u.id === userId);
      if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Remove user from fallback data
      fallbackUsers.splice(userIndex, 1);
      
      // Remove user's orders
      const orderIndicesToRemove = fallbackOrders.map((order: any, index: number) => 
        order.userId === userId ? index : -1
      ).filter(index => index !== -1).reverse();
      
      orderIndicesToRemove.forEach(index => fallbackOrders.splice(index, 1));
    }

    res.json({ message: 'User data purged successfully' });
  } catch (error) {
    console.error('Purge user error:', error);
    res.status(500).json({ error: 'Failed to purge user data' });
  }
});

// Broadcast message to users (admin only)
router.post('/broadcast', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { message, targetIds } = req.body;

    if (!req.prisma) {
      return res.status(500).json({ error: 'Database connection not available' });
    }

    if (targetIds && Array.isArray(targetIds)) {
      // Send to specific users
      await req.prisma.user.updateMany({
        where: { id: { in: targetIds } },
        data: {
          notifications: { push: message }
        }
      });
    } else {
      // Send to all users
      await req.prisma.user.updateMany({
        data: {
          notifications: { push: message }
        }
      });
    }

    const targetCount = targetIds ? targetIds.length : await req.prisma.user.count();
    res.json({ message: `Broadcast sent to ${targetCount} users` });
  } catch (error) {
    console.error('Broadcast error:', error);
    res.status(500).json({ error: 'Failed to send broadcast' });
  }
});

// Update payment details (admin only)
router.put('/payment-accounts/:provider', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { provider } = req.params;
    const { name, number, active } = req.body;

    if (!req.prisma) {
      return res.status(500).json({ error: 'Database connection not available' });
    }

    const paymentAccount = await req.prisma.paymentAccount.upsert({
      where: { provider },
      update: { name, number, active },
      create: { provider, name, number, active }
    });

    res.json({ paymentAccount, message: 'Payment account updated successfully' });
  } catch (error) {
    console.error('Update payment account error:', error);
    res.status(500).json({ error: 'Failed to update payment account' });
  }
});

// Update settings (admin only)
router.put('/settings/:key', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (!req.prisma) {
      return res.status(500).json({ error: 'Database connection not available' });
    }

    const setting = await req.prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });

    res.json({ setting, message: 'Setting updated successfully' });
  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({ error: 'Failed to update setting' });
  }
});

export default router;