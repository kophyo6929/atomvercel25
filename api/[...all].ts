import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set up serverless environment variables
  process.env.NODE_ENV = 'production';
  process.env.VERCEL = '1';

  try {
    // Dynamic import to handle module resolution in serverless environment
    const moduleImport = await import('../backend/dist/index.js');
    const app = moduleImport.default;
    
    // Validate that app is an Express instance
    if (!app || typeof app !== 'object' || typeof app.handle !== 'function') {
      console.error('App is not valid Express instance:', typeof app, app);
      return res.status(500).json({ 
        error: 'Server configuration error',
        message: 'Express app not properly exported'
      });
    }
    
    // Handle the request with Express app
    return new Promise((resolve, reject) => {
      app(req, res, (err?: any) => {
        if (err) reject(err);
        else resolve(undefined);
      });
    });
  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Serverless function failed to process request'
    });
  }
}