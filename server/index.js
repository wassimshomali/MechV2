/**
 * MoMech Server Entry Point
 * Express.js server with SQLite database integration
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

// Import configuration
const config = require('../config/app');
const dbConnection = require('./database/connection');

// Import routes
const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/clients');
const vehicleRoutes = require('./routes/vehicles');
const appointmentRoutes = require('./routes/appointments');
const inventoryRoutes = require('./routes/inventory');
const financialRoutes = require('./routes/financial');
const servicesRoutes = require('./routes/services');
const workOrderRoutes = require('./routes/work-orders');
const dashboardRoutes = require('./routes/dashboard');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

class Server {
  constructor() {
    this.app = express();
    this.port = config.SERVER.PORT;
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupMiddleware() {
    // Security middleware
    if (config.SECURITY.ENABLE_HELMET) {
      this.app.use(helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://unpkg.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://unpkg.com", "https://cdn.jsdelivr.net"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
            fontSrc: ["'self'", "https:", "data:"],
            connectSrc: ["'self'", "http://localhost:3001"],
            mediaSrc: ["'self'"],
            objectSrc: ["'none'"],
            frameSrc: ["'none'"]
          }
        }
      }));
    }

    // CORS configuration
    if (config.SECURITY.ENABLE_CORS) {
      this.app.use(cors({
        origin: config.SERVER.CORS_ORIGIN,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
      }));
    }

    // Rate limiting
    const limiter = rateLimit({
      windowMs: config.SECURITY.RATE_LIMIT_WINDOW,
      max: config.SECURITY.RATE_LIMIT_MAX_REQUESTS,
      message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(config.SECURITY.RATE_LIMIT_WINDOW / 1000 / 60)
      },
      standardHeaders: true,
      legacyHeaders: false
    });
    this.app.use(limiter);

    // Body parsing middleware
    this.app.use(express.json({ 
      limit: config.PERFORMANCE.MAX_REQUEST_SIZE 
    }));
    this.app.use(express.urlencoded({ 
      extended: true, 
      limit: config.PERFORMANCE.MAX_REQUEST_SIZE 
    }));

    // Static file serving
    this.app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
    this.app.use('/assets', express.static(path.join(__dirname, '../public')));
    
    // Serve the main application
    this.app.use(express.static(path.join(__dirname, '../')));

    // Request logging
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });
      next();
    });

    // Request timeout
    this.app.use((req, res, next) => {
      req.setTimeout(config.PERFORMANCE.TIMEOUT);
      next();
    });
  }

  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: config.APP_VERSION,
        environment: config.ENVIRONMENT
      });
    });

    // API routes
    const apiRouter = express.Router();
    
    // Authentication routes (kept for potential future use)
    apiRouter.use('/auth', authRoutes);
    
    // Resource routes (no authentication required - single user app)
    apiRouter.use('/clients', clientRoutes);
    apiRouter.use('/vehicles', vehicleRoutes);
    apiRouter.use('/appointments', appointmentRoutes);
    apiRouter.use('/inventory', inventoryRoutes);
    apiRouter.use('/financial', financialRoutes);
    apiRouter.use('/services', servicesRoutes);
    apiRouter.use('/work-orders', workOrderRoutes);
    apiRouter.use('/dashboard', dashboardRoutes);

    // Mount API routes
    this.app.use('/api/v1', apiRouter);

    // Serve the main HTML file for SPA routing
    this.app.get('*', (req, res) => {
      // Don't serve HTML for API routes
      if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
      }
      
      res.sendFile(path.join(__dirname, '../index.html'));
    });
  }

  setupErrorHandling() {
    // 404 handler for API routes
    this.app.use('/api/*', (req, res) => {
      res.status(404).json({
        error: 'API endpoint not found',
        path: req.path,
        method: req.method
      });
    });

    // Global error handler
    this.app.use(errorHandler);
  }

  async initializeDatabase() {
    try {
      await dbConnection.initialize();
      logger.info('Database initialized successfully');
    } catch (error) {
      logger.error('Database initialization failed:', error);
      throw error;
    }
  }

  async start() {
    try {
      // Validate configuration
      const configErrors = config.validate();
      if (configErrors.length > 0) {
        throw new Error(`Configuration errors: ${configErrors.join(', ')}`);
      }

      // Initialize database
      await this.initializeDatabase();

      // Start server
      this.server = this.app.listen(this.port, config.SERVER.HOST, () => {
        logger.info(`🚀 MoMech server running on http://${config.SERVER.HOST}:${this.port}`);
        logger.info(`📊 Environment: ${config.ENVIRONMENT}`);
        logger.info(`🗄️  Database: ${config.DATABASE.PATH}`);
        
        if (config.ENVIRONMENT === 'development') {
          logger.info(`🔧 Frontend dev server: http://localhost:3000`);
        }
      });

      // Graceful shutdown handling
      this.setupGracefulShutdown();

    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  setupGracefulShutdown() {
    const gracefulShutdown = (signal) => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`);
      
      if (this.server) {
        this.server.close(async () => {
          logger.info('HTTP server closed');
          
          try {
            await dbConnection.close();
            logger.info('Database connection closed');
          } catch (error) {
            logger.error('Error closing database:', error);
          }
          
          logger.info('Graceful shutdown completed');
          process.exit(0);
        });
      }
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });
  }

  async stop() {
    if (this.server) {
      return new Promise((resolve) => {
        this.server.close(resolve);
      });
    }
  }
}

// Create and start server if this file is run directly
if (require.main === module) {
  const server = new Server();
  server.start().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}

module.exports = Server;
