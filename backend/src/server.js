import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import multer from 'multer';
import coursesRouter from './routes/courses.js';
import ttsSttRouter from './routes/ttsStt.js';
import { testConnection, initDatabase, initializeDatabasePool } from './utils/database.js';
import { azureStorageService } from './services/azureStorageService.js';

dotenv.config();

const app = express();
// Use port 8181 as per CTO's findings (container actually listens on 8181)
const PORT = 8181;

// CTO's simple health route (without DB/KeyVault calls)
app.get("/healthz", (_req, res) => res.status(200).send("OK"));
app.get("/", (_req, res) => res.status(200).send("Up"));

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://teknotassen.vercel.app', 'https://web-teknotassen.azurewebsites.net']
    : ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:3000'],
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint (Azure App Service)
app.get('/healthz', async (req, res) => {
  try {
    // Check database connection if available
    let dbStatus = 'unknown';
    try {
      const dbConnected = await testConnection();
      dbStatus = dbConnected ? 'connected' : 'disconnected';
    } catch (error) {
      dbStatus = 'error';
    }
    
    res.status(200).json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      port: PORT,
      database: dbStatus,
      services: {
        database: dbStatus === 'connected',
        storage: !!process.env.BLOB_CONNECTION_STRING || !!process.env.AZURE_KEY_VAULT_URL,
        keyvault: !!process.env.AZURE_KEY_VAULT_URL
      }
    });
  } catch (error) {
    res.status(200).json({ 
      status: 'degraded', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      port: PORT,
      database: 'error',
      error: error.message
    });
  }
});

// Legacy health endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/courses', coursesRouter);
app.use('/api/tts-stt', ttsSttRouter);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  
  if (error.name === 'MulterError') {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'File too large', 
        message: 'File size must be less than 10MB' 
      });
    }
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Initialize database and start server
async function startServer() {
  try {
    console.log('🚀 Starting TeknoTassen RAG Backend...');
    
    // Initialize database connection (but don't crash if it fails)
    let dbConnected = false;
    try {
      // Test database connection
      dbConnected = await testConnection();
      if (dbConnected) {
        console.log('✅ Database connection successful');
        
        // Initialize database tables
        await initDatabase();
        console.log('✅ Database tables initialized');
      }
    } catch (dbError) {
      console.warn('⚠️ Database initialization failed (continuing without database):', dbError.message);
      dbConnected = false;
    }
    
    // Initialize Azure PostgreSQL (if configured)
    if (process.env.POSTGRES_URL) {
      try {
        // Use environment variable (Azure App Service)
        await initializeDatabasePool();
        console.log('✅ Azure PostgreSQL initialized from environment variables');
        dbConnected = true;
      } catch (error) {
        console.warn('⚠️ Azure PostgreSQL initialization failed:', error.message);
      }
    } else if (process.env.AZURE_KEY_VAULT_URL) {
      try {
        await azureStorageService.initializeKeyVault();
        
        // Try to use app user connection string first (recommended)
        let postgresConnectionString;
        try {
          postgresConnectionString = await azureStorageService.getPostgresAppConnectionString();
          console.log('✅ Using PostgreSQL app user connection');
        } catch (error) {
          console.log('ℹ️ App user connection not available, falling back to admin connection');
          postgresConnectionString = await azureStorageService.getPostgresConnectionString();
        }
        
        await initializeDatabasePool(postgresConnectionString);
        console.log('✅ Azure PostgreSQL initialized successfully');
        dbConnected = true;
      } catch (error) {
        console.warn('⚠️ Azure PostgreSQL initialization failed (continuing without database):', error.message);
      }
    } else {
      console.log('ℹ️ Azure PostgreSQL not configured (using local database)');
      try {
        await initializeDatabasePool(); // Initialize local database
        dbConnected = true;
      } catch (error) {
        console.warn('⚠️ Local database initialization failed:', error.message);
      }
    }
    
    // Initialize Azure Storage (if configured)
    if (process.env.BLOB_CONNECTION_STRING) {
      try {
        await azureStorageService.initialize();
        console.log('✅ Azure Storage initialized from environment variables');
      } catch (error) {
        console.warn('⚠️ Azure Storage initialization failed (continuing without it):', error.message);
      }
    } else if (process.env.AZURE_KEY_VAULT_URL) {
      try {
        await azureStorageService.initialize();
        console.log('✅ Azure Storage initialized from Key Vault');
      } catch (error) {
        console.warn('⚠️ Azure Storage initialization failed (continuing without it):', error.message);
      }
    } else {
      console.log('ℹ️ Azure Storage not configured (using local storage)');
    }
    
    // Start server (even if database connection failed)
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://0.0.0.0:${PORT}/healthz`);
      console.log(`📚 API docs: http://0.0.0.0:${PORT}/api/courses`);
      console.log(`💾 Database status: ${dbConnected ? 'Connected' : 'Not connected'}`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    // Don't exit, try to start server anyway
    console.log('🔄 Attempting to start server without full initialization...');
    
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server running on port ${PORT} (limited functionality)`);
      console.log(`🔗 Health check: http://0.0.0.0:${PORT}/healthz`);
      console.log(`⚠️ Some features may not work due to initialization errors`);
    });
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();
