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
const PORT = process.env.PORT || 3000;

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
app.get('/healthz', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    database: 'connected'
  });
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
    
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ Cannot start server without database connection');
      process.exit(1);
    }
    
    // Initialize Azure PostgreSQL (if configured)
    if (process.env.POSTGRES_URL) {
      // Use environment variable (Azure App Service)
      await initializeDatabasePool();
      console.log('✅ Azure PostgreSQL initialized from environment variables');
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
      } catch (error) {
        console.warn('⚠️ Azure PostgreSQL initialization failed (continuing with local database):', error.message);
        await initializeDatabasePool(); // Initialize local database
      }
    } else {
      console.log('ℹ️ Azure PostgreSQL not configured (using local database)');
      await initializeDatabasePool(); // Initialize local database
    }
    
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ Cannot start server without database connection');
      process.exit(1);
    }
    
    // Initialize database tables
    await initDatabase();
    
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
    
    // Start server
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API docs: http://localhost:${PORT}/api/courses`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
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
