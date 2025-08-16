import { OpenAIEmbeddings } from '@langchain/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { getPool } from '../utils/database.js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize OpenAI embeddings
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: 'text-embedding-3-small',
  dimensions: 1536,
});

// Text splitter for chunking
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
  separators: ['\n\n', '\n', '. ', '! ', '? ', ' ', ''],
});

export class EmbeddingService {
  // Process and store a course with embeddings
  static async processCourse(courseData) {
    const pool = getPool();
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Insert course
      const courseResult = await client.query(`
        INSERT INTO courses (title, slug, technology, tags, content_md, uploaded_by)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `, [
        courseData.title,
        courseData.slug,
        courseData.technology,
        courseData.tags || [],
        courseData.content_md,
        courseData.uploaded_by
      ]);
      
      const courseId = courseResult.rows[0].id;
      
      // Split content into chunks
      const chunks = await textSplitter.splitText(courseData.content_md);
      
      // Generate embeddings for each chunk
      const embeddingsList = await embeddings.embedDocuments(chunks);
      
          // Store chunks with embeddings
    for (let i = 0; i < chunks.length; i++) {
      // Convert embedding array to proper pgvector format
      const embeddingArray = embeddingsList[i];
      await client.query(`
        INSERT INTO course_chunks (course_id, chunk_index, content, embedding)
        VALUES ($1, $2, $3, $4::vector)
      `, [courseId, i, chunks[i], embeddingArray]);
    }
      
      await client.query('COMMIT');
      
      console.log(`✅ Course processed: ${chunks.length} chunks created`);
      return { courseId, chunkCount: chunks.length };
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  // Search for relevant chunks based on query
  static async searchChunks(query, technology = null, limit = 5) {
    try {
      // Generate embedding for the query
      const queryEmbedding = await embeddings.embedQuery(query);
      
      // Build search query
      let searchQuery = `
        SELECT 
          cc.content,
          cc.chunk_index,
          c.title as course_title,
          c.technology,
          c.tags,
          1 - (cc.embedding <=> $1) as similarity
        FROM course_chunks cc
        JOIN courses c ON cc.course_id = c.id
        WHERE cc.embedding IS NOT NULL
      `;
      
      const queryParams = [queryEmbedding];
      
      if (technology) {
        searchQuery += ` AND c.technology = $2`;
        queryParams.push(technology);
      }
      
      searchQuery += `
        ORDER BY cc.embedding <=> $1::vector
        LIMIT $${queryParams.length + 1}
      `;
      
      queryParams.push(limit);
      
      console.log('🔍 Search query:', searchQuery);
      console.log('🔍 Query params:', queryParams);
      
      const pool = getPool();
      const result = await pool.query(searchQuery, queryParams);
      
      return result.rows.map(row => ({
        content: row.content,
        chunkIndex: row.chunk_index,
        courseTitle: row.course_title,
        technology: row.technology,
        tags: row.tags,
        similarity: row.similarity
      }));
      
    } catch (error) {
      console.error('Error searching chunks:', error);
      throw error;
    }
  }
  
  // Get all courses
  static async getAllCourses() {
    try {
      const pool = getPool();
      const result = await pool.query(`
        SELECT id, title, slug, technology, tags, created_at
        FROM courses
        ORDER BY created_at DESC
      `);
      
      return result.rows;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  }
  
  // Get course by ID with chunks
  static async getCourseById(courseId) {
    try {
      const pool = getPool();
      const courseResult = await pool.query(`
        SELECT * FROM courses WHERE id = $1
      `, [courseId]);
      
      if (courseResult.rows.length === 0) {
        return null;
      }
      
      const chunksResult = await pool.query(`
        SELECT content, chunk_index, created_at
        FROM course_chunks
        WHERE course_id = $1
        ORDER BY chunk_index
      `, [courseId]);
      
      return {
        ...courseResult.rows[0],
        chunks: chunksResult.rows
      };
      
    } catch (error) {
      console.error('Error fetching course:', error);
      throw error;
    }
  }
  
  // Delete course and all its chunks
  static async deleteCourse(courseId) {
    try {
      const pool = getPool();
      await pool.query('DELETE FROM courses WHERE id = $1', [courseId]);
      console.log(`✅ Course deleted: ${courseId}`);
      return true;
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  }
}
