import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Database connection pool
export const pool = new Pool({
  user: process.env.DB_USER || 'ann-kristin',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'teknotassen_dev',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Test database connection
export async function testConnection() {
  try {
    const client = await pool.connect();
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
    const client = await pool.connect();
    
    // Create courses table
    await client.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        technology TEXT NOT NULL,
        tags TEXT[] DEFAULT '{}',
        content_md TEXT NOT NULL,
        uploaded_by UUID,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Create course_chunks table
    await client.query(`
      CREATE TABLE IF NOT EXISTS course_chunks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        embedding VECTOR(1536),
        chunk_index INT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Create indexes
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
