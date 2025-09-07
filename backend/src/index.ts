import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import adminRoutes from './routes/admin';

const app = express();

// Trust proxy for rate limiting
app.set('trust proxy', 1);
let prisma: PrismaClient | null = null;
let dbConnected = false;

// Try to connect to database and validate schema
async function initializeDatabase() {
  try {
    if (process.env.DATABASE_URL) {
      prisma = new PrismaClient();
      await prisma.$connect();
      
      // Test if the database schema exists by trying to count users
      await prisma.user.count();
      
      console.log('✅ Database connected and schema validated successfully');
      dbConnected = true;
    } else {
      console.log('⚠️ No DATABASE_URL provided - using fallback data');
      dbConnected = false;
      prisma = null;
    }
  } catch (error) {
    console.log('⚠️ Database connection or schema validation failed - using fallback data');
    console.log('Database error:', error);
    dbConnected = false;
    
    // Disconnect prisma if connection was established but schema is invalid
    if (prisma) {
      try {
        await prisma.$disconnect();
      } catch (disconnectError) {
        console.log('Error disconnecting Prisma:', disconnectError);
      }
    }
    prisma = null;
  }
}

const PORT = parseInt(process.env.PORT || '3001');

// Professional rate limiting configuration
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 200, // Allow 200 requests per minute for better UX
  message: {
    error: 'Too many requests, please try again later.',
    retryAfter: 60
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip successful responses to allow normal operations
  skipSuccessfulRequests: true,
  // Different limits for different endpoints
  skip: (req) => {
    // Skip rate limiting for health checks and static content
    return req.path === '/api/health';
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:5000',
    'https://82352b2d-6d4d-4c86-9665-c9ced5dad4b3-00-3ec2f9xrh9ner.spock.replit.dev',
    'https://atomvercel20.vercel.app',
    process.env.FRONTEND_URL || 'http://localhost:5000',
    /^https:\/\/.*\.vercel\.app$/  // Allow all Vercel deployment URLs
  ],
  credentials: true
}));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Make Prisma and DB status available to routes
app.use((req, res, next) => {
  req.prisma = prisma;
  req.dbConnected = dbConnected;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database - handle both local and serverless environments
if (process.env.VERCEL) {
  // In Vercel serverless, don't auto-initialize, let it use fallback data
  console.log('🔄 Running in Vercel serverless mode - using fallback data');
  dbConnected = false;
  prisma = null;
} else {
  // In local development, try to initialize database
  initializeDatabase();
}

// For development (local server)
if (process.env.NODE_ENV !== 'production') {
  const server = app.listen(PORT, '127.0.0.1', () => {
    console.log(`🚀 Backend server running on http://127.0.0.1:${PORT}`);
    console.log(`📊 Health check available at http://127.0.0.1:${PORT}/api/health`);
    console.log(`💾 Database: ${dbConnected ? 'Connected' : 'Using fallback data'}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(async () => {
      console.log('HTTP server closed');
      if (prisma) await prisma.$disconnect();
      process.exit(0);
    });
  });
}

// For production (Vercel serverless)
export default app;