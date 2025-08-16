import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Database connection pool - supports both local and Azure PostgreSQL
let pool = null;

// Initialize database pool with Azure PostgreSQL connection string if available
export async function initializeDatabasePool(azureConnectionString = null) {
  if (pool) {
    await pool.end();
  }

  if (azureConnectionString) {
    // Use Azure PostgreSQL connection string from Key Vault
    pool = new Pool({
      connectionString: azureConnectionString,
      ssl: { rejectUnauthorized: false }, // Required for Azure PostgreSQL
      max: 20, // Connection pool size
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
    console.log('✅ Azure PostgreSQL connection pool initialized');
  } else {
    // Fallback to local database configuration
    pool = new Pool({
      user: process.env.DB_USER || 'ann-kristin',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'teknotassen_dev',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 5432,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
    console.log('✅ Local PostgreSQL connection pool initialized');
  }
}

// Get database pool (initialize if needed)
export function getPool() {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initializeDatabasePool() first.');
  }
  return pool;
}

// Test database connection
export async function testConnection() {
  try {
    const currentPool = getPool();
    const client = await currentPool.connect();
    console.log('✅ Database connected successfully');
    
    // Test pgvector extension
    const result = await client.query('SELECT * FROM pg_extension WHERE extname = $1', ['vector']);
    if (result.rows.length > 0) {
      console.log('✅ pgvector extension is active');
    } else {
      console.log('❌ pgvector extension not found');
    }
    
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Initialize database tables
export async function initDatabase() {
  try {
    const currentPool = getPool();
    const client = await currentPool.connect();
    
    // Create extensions
    await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
    await client.query('CREATE EXTENSION IF NOT EXISTS vector;');
    
    // Create courses table
    await client.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        slug TEXT UNIQUE,
        technology TEXT,
        tags TEXT[],
        content_md TEXT,
        uploaded_by TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);
    
    // Create course_chunks table
    await client.query(`
      CREATE TABLE IF NOT EXISTS course_chunks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
        chunk_index INT NOT NULL,
        content TEXT NOT NULL,
        embedding VECTOR(1536)
      );
    `);
    
    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_course_chunks_course 
      ON course_chunks(course_id);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_course_chunks_embedding 
      ON course_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_courses_technology ON courses(technology);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_courses_tags ON courses USING GIN(tags);
    `);
    
    console.log('✅ Database tables initialized successfully');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    return false;
  }
}
