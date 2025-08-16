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

  // Check for Azure environment variables first
  const postgresUrl = process.env.POSTGRES_URL;
  
  if (postgresUrl) {
    // Use Azure PostgreSQL connection string from environment
    pool = new Pool({
      connectionString: postgresUrl,
      ssl: { rejectUnauthorized: false }, // Required for Azure PostgreSQL
      max: 20, // Connection pool size
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
    console.log('✅ Azure PostgreSQL connection pool initialized from environment');
  } else if (azureConnectionString) {
    // Use Azure PostgreSQL connection string from Key Vault
    pool = new Pool({
      connectionString: azureConnectionString,
      ssl: { rejectUnauthorized: false }, // Required for Azure PostgreSQL
      max: 20, // Connection pool size
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
    console.log('✅ Azure PostgreSQL connection pool initialized from Key Vault');
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
    
    // Create course_chunks table with nano/unit hierarchy
    await client.query(`
      CREATE TABLE IF NOT EXISTS course_chunks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
        chunk_index INT NOT NULL,
        content TEXT NOT NULL,
        content_markdown TEXT NOT NULL,
        embedding VECTOR(1536),
        nano_slug TEXT,
        unit_slug TEXT,
        meta JSONB DEFAULT '{}'::jsonb
      );
    `);
    
    // Create course_assets table for images/audio
    await client.query(`
      CREATE TABLE IF NOT EXISTS course_assets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
        nano_slug TEXT,
        unit_slug TEXT,
        url TEXT NOT NULL,
        kind TEXT CHECK (kind IN ('image','audio','other')) DEFAULT 'image',
        alt TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
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
      CREATE INDEX IF NOT EXISTS idx_course_chunks_nano 
      ON course_chunks(nano_slug);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_course_chunks_unit 
      ON course_chunks(unit_slug);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_courses_technology ON courses(technology);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_courses_tags ON courses USING GIN(tags);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_assets_course ON course_assets(course_id);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_assets_unit ON course_assets(unit_slug);
    `);
    
    console.log('✅ Database tables initialized successfully');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    return false;
  }
}
