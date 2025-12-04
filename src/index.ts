import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { requestLogger } from './middleware/logger.middleware';
import { errorHandler } from './middleware/error.middleware';
import prisma from './utils/prisma';
import logger from './utils/logger';

import leadRoutes from './modules/leads/lead.routes';
import eventRoutes from './modules/events/event.routes';
import quoteRoutes from './modules/quotes/quote.routes';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.get('/health', async (req: Request, res: Response) => {
  const startTime = process.uptime();
  let dbStatus = 'disconnected';
  let dbError = null;

  try {
    await (prisma as any).$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch (error: any) {
    dbStatus = 'error';
    const errorMsg = error.message || 'Database connection failed';
    
    if (errorMsg.includes('prepared statement') || errorMsg.includes('42P05')) {
      dbError = 'Supabase pooler issue detected. Solution: Use direct connection in .env (change port 6543 to 5432 and remove .pooler. from URL)';
    } else if (errorMsg.includes('does not exist')) {
      dbError = 'Database tables missing. Run migrations first: npx prisma db push';
    } else {
      dbError = errorMsg;
    }
    
    logger.error('Database health check failed:', error);
  }

  const healthData = {
    status: 'ok',
    uptime: Math.floor(startTime),
    database: dbStatus,
    timestamp: new Date().toISOString(),
  };

  if (dbError) {
    (healthData as any).databaseError = dbError;
  }

  const statusCode = dbStatus === 'connected' ? 200 : 503;
  res.status(statusCode).json(healthData);
});

app.all('/api/quotes/generate', (req: Request, res: Response, next: any) => {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. This endpoint only accepts POST requests.',
      method: req.method,
      allowed: 'POST',
    });
  }
  next();
});

app.use('/api/leads', leadRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/quotes', quoteRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Sports Travel Packages API',
    version: '1.0.0',
    docs: '/api-docs',
    health: '/health',
    endpoints: {
      events: '/api/events',
      leads: '/api/leads',
      quotes: '/api/quotes/generate (POST)',
    },
  });
});

app.use(errorHandler);

if (process.env.VERCEL !== '1') {
  const server = app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
    logger.info(`❤️  Health Check: http://localhost:${PORT}/health`);
  });

  process.on('SIGTERM', async () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    server.close(async () => {
      logger.info('HTTP server closed');
      await prisma.$disconnect();
      process.exit(0);
    });
  });

  process.on('SIGINT', async () => {
    logger.info('SIGINT signal received: closing HTTP server');
    server.close(async () => {
      logger.info('HTTP server closed');
      await prisma.$disconnect();
      process.exit(0);
    });
  });
}

export default app;
