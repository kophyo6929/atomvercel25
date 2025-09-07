import express, { Response } from 'express';
import { AuthRequest, authenticateToken } from '../middleware/auth';
import { fallbackProducts, fallbackOrders, fallbackUsers } from '../controllers/fallbackData';

const router = express.Router();

// Get user's orders
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    let orders;
    
    if (req.dbConnected && req.prisma) {
      const dbOrders = await req.prisma.order.findMany({
        where: { userId: req.user!.id },
        orderBy: { createdAt: 'desc' }
      });

      // Transform to frontend format
      orders = await Promise.all(dbOrders.map(async (order: any) => {
        let productName = '';
        if (order.type === 'CREDIT') {
          productName = `${order.amount} MMK Credit Purchase`;
        } else if (order.productId && req.prisma) {
          try {
            const product = await req.prisma.product.findUnique({
              where: { id: order.productId }
            });
            productName = product ? product.name : `Product ${order.productId}`;
          } catch (e) {
            productName = `Product ${order.productId}`;
          }
        }

        return {
          id: order.id.toString(),
          userId: order.userId,
          type: order.type,
          productName,
          amount: order.amount,
          status: order.status,
          createdAt: order.createdAt.toISOString(),
          proofImage: order.proofImage
        };
      }));
    } else {
      // Fallback approach
      orders = fallbackOrders.filter((order: any) => order.userId === req.user!.id)
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .map((order: any) => ({
          id: order.id.toString(),
          userId: order.userId,
          type: order.type,
          productName: order.type === 'CREDIT' ? `${order.amount} MMK Credit Purchase` : 'Product Order',
          amount: order.amount,
          status: order.status,
          createdAt: order.createdAt,
          proofImage: order.proofImage
        }));
    }

    res.json({ orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Create credit purchase order
router.post('/credit', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { amount, proofImage } = req.body;

    if (!amount || amount < 1000) {
      return res.status(400).json({ error: 'Minimum credit amount is 1000 MMK' });
    }

    let order;
    
    if (req.dbConnected && req.prisma) {
      order = await req.prisma.order.create({
        data: {
          userId: req.user!.id,
          type: 'CREDIT',
          amount: parseInt(amount),
          proofImage,
          status: 'PENDING'
        }
      });

      // Send notification to admin
      await req.prisma.user.updateMany({
        where: { isAdmin: true },
        data: {
          notifications: {
            push: `💰 Credit Request: ${req.user!.username} requests ${amount} MMK via KPay.`
          }
        }
      });
    } else {
      // Fallback approach
      order = {
        id: Date.now(),
        userId: req.user!.id,
        type: 'CREDIT',
        amount: parseInt(amount),
        proofImage,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      fallbackOrders.push(order);
      
      // Add notification to admin users
      fallbackUsers.forEach((user: any) => {
        if (user.isAdmin) {
          user.notifications.push(`💰 Credit Request: ${req.user!.username} requests ${amount} MMK via KPay.`);
        }
      });
    }

    res.status(201).json({ 
      order,
      message: 'Credit purchase request submitted successfully' 
    });
  } catch (error) {
    console.error('Create credit order error:', error);
    res.status(500).json({ error: 'Failed to create credit order' });
  }
});

// Create product purchase order
router.post('/product', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { productId } = req.body;

    console.log('Product purchase request:', { productId, bodyKeys: Object.keys(req.body) });

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    let product, user;
    
    if (req.dbConnected && req.prisma) {
      // Simple direct lookup using string ID
      product = await req.prisma.product.findUnique({
        where: { id: productId.toString() }
      });
      
      user = await req.prisma.user.findUnique({
        where: { id: req.user!.id }
      });
    } else {
      // Fallback approach - direct string ID lookup
      product = fallbackProducts.find((p: any) => p.id === productId);
      user = fallbackUsers.find((u: any) => u.id === req.user!.id);
    }

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.credits < product.priceCr) {
      return res.status(400).json({ error: 'Insufficient credits' });
    }

    if (req.dbConnected && req.prisma) {
      // Create order without deducting credits yet (will be deducted when approved)
      await req.prisma.order.create({
        data: {
          userId: req.user!.id,
          type: 'PRODUCT',
          amount: product!.priceCr,
          productId: productId.toString(),
          status: 'PENDING'
        }
      });

      // Send notification to admin
      await req.prisma.user.updateMany({
        where: { isAdmin: true },
        data: {
          notifications: {
            push: `🛒 Product Order: ${req.user!.username} ordered ${product.name}`
          }
        }
      });
    } else {
      // Fallback approach - don't deduct credits yet, wait for approval
      
      const order = {
        id: Date.now(),
        userId: req.user!.id,
        type: 'PRODUCT',
        amount: product.priceCr,
        productId: productId.toString(),
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      fallbackOrders.push(order);
      
      // Add notification to admin users
      fallbackUsers.forEach((u: any) => {
        if (u.isAdmin) {
          u.notifications.push(`🛒 Product Order: ${req.user!.username} ordered ${product.name}`);
        }
      });
    }

    res.status(201).json({ 
      message: `Product order placed successfully. Your order is pending admin approval. Credits will be deducted upon approval.` 
    });
  } catch (error) {
    console.error('Create product order error:', error);
    res.status(500).json({ error: 'Failed to create product order' });
  }
});

export default router;