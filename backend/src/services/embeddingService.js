import { OpenAIEmbeddings } from '@langchain/openai';
import { getPool } from '../utils/database.js';
import MarkdownParserService from './markdownParserService.js';
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
  // Process and store a course with embeddings using Nano/Unit structure
  static async processCourse(courseData) {
    const pool = getPool();
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Parse markdown into Nano/Unit structure
      const parsed = MarkdownParserService.parseMarkdown(courseData.content_md);
      
      // Insert course
      const courseResult = await client.query(`
        INSERT INTO courses (title, slug, technology, tags, content_md, uploaded_by)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `, [
        courseData.title || parsed.title,
        courseData.slug,
        courseData.technology,
        courseData.tags || [],
        courseData.content_md,
        courseData.uploaded_by
      ]);
      
      const courseId = courseResult.rows[0].id;
      let totalChunks = 0;
      
      // Process each Nano and its Units
      for (const nano of parsed.nanos) {
        for (const unit of nano.units) {
          // Split unit content into chunks if needed
          let chunks = [unit.content_plain];
          if (unit.content_plain.length > 1500) {
            chunks = await MarkdownParserService.splitContent(unit.content_plain, 1500);
          }
          
          // Generate embeddings for chunks
          const embeddingsList = await embeddings.embedDocuments(chunks);
          
          // Store chunks with embeddings
          for (let i = 0; i < chunks.length; i++) {
            const embeddingArray = embeddingsList[i];
            await client.query(`
              INSERT INTO course_chunks (
                course_id, chunk_index, content, content_markdown, 
                embedding, nano_slug, unit_slug, meta
              )
              VALUES ($1, $2, $3, $4, $5::vector, $6, $7, $8)
            `, [
              courseId, 
              totalChunks + i, 
              chunks[i], 
              unit.content,
              embeddingArray, 
              nano.slug, 
              unit.slug,
              JSON.stringify({
                nano_title: nano.title,
                unit_title: unit.title,
                frontmatter: parsed.frontmatter
              })
            ]);
          }
          
          // Store assets for this unit
          for (const asset of unit.assets) {
            await client.query(`
              INSERT INTO course_assets (
                course_id, nano_slug, unit_slug, url, kind, alt
              )
              VALUES ($1, $2, $3, $4, $5, $6)
            `, [
              courseId,
              nano.slug,
              unit.slug,
              asset.url,
              asset.kind,
              asset.alt
            ]);
          }
          
          totalChunks += chunks.length;
        }
      }
      
      await client.query('COMMIT');
      
      console.log(`✅ Course processed: ${totalChunks} chunks created across ${parsed.nanos.length} nanos`);
      return {
        courseId,
        chunkCount: totalChunks,
        nanoCount: parsed.nanos.length,
        unitCount: parsed.nanos.reduce((sum, nano) => sum + nano.units.length, 0),
        assetCount: parsed.nanos.reduce((sum, nano) => 
          sum + nano.units.reduce((unitSum, unit) => unitSum + unit.assets.length, 0), 0
        )
      };
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  // Search for relevant chunks based on query with Nano/Unit structure
  static async searchChunks(query, technology = null, limit = 5, filters = {}) {
    try {
      // Generate embedding for the query
      const queryEmbedding = await embeddings.embedQuery(query);
      
      // Build search query
      let searchQuery = `
        SELECT 
          cc.content,
          cc.content_markdown,
          cc.chunk_index,
          cc.nano_slug,
          cc.unit_slug,
          cc.meta,
          c.title as course_title,
          c.technology,
          c.tags,
          1 - (cc.embedding <=> $1::vector) as similarity
        FROM course_chunks cc
        JOIN courses c ON cc.course_id = c.id
        WHERE cc.embedding IS NOT NULL
      `;
      
      const queryParams = [queryEmbedding];
      let paramIndex = 2;
      
      // Apply filters
      if (technology) {
        searchQuery += ` AND c.technology = $${paramIndex}`;
        queryParams.push(technology);
        paramIndex++;
      }
      
      if (filters.courseId) {
        searchQuery += ` AND c.id = $${paramIndex}`;
        queryParams.push(filters.courseId);
        paramIndex++;
      }
      
      // TODO: Add RBAC filters for tenant/role when implemented
      // if (filters.tenantId) { ... }
      // if (filters.roles) { ... }
      
      searchQuery += `
        ORDER BY cc.embedding <=> $1::vector
        LIMIT $${paramIndex}
      `;
      
      queryParams.push(limit);
      
      console.log('🔍 Search query:', searchQuery);
      console.log('🔍 Query params:', queryParams);
      
      const pool = getPool();
      const result = await pool.query(searchQuery, queryParams);
      
      // Group results by Nano and Unit
      const groupedResults = {};
      
      for (const row of result.rows) {
        const nanoSlug = row.nano_slug || 'unknown';
        const unitSlug = row.nano_slug || 'unknown';
        
        if (!groupedResults[nanoSlug]) {
          groupedResults[nanoSlug] = {
            nano_title: row.meta?.nano_title || nanoSlug,
            units: {}
          };
        }
        
        if (!groupedResults[nanoSlug].units[unitSlug]) {
          groupedResults[nanoSlug].units[unitSlug] = {
            unit_title: row.meta?.unit_title || unitSlug,
            chunks: [],
            assets: []
          };
        }
        
        groupedResults[nanoSlug].units[unitSlug].chunks.push({
          content: row.content,
          content_markdown: row.content_markdown,
          chunkIndex: row.chunk_index,
          similarity: row.similarity
        });
      }
      
      // Fetch assets for the found units
      for (const nanoSlug in groupedResults) {
        for (const unitSlug in groupedResults[nanoSlug].units) {
          const assetsResult = await pool.query(`
            SELECT url, kind, alt
            FROM course_assets
            WHERE nano_slug = $1 AND unit_slug = $2
            AND course_id = $3
          `, [nanoSlug, unitSlug, result.rows[0]?.course_id]);
          
          groupedResults[nanoSlug].units[unitSlug].assets = assetsResult.rows;
        }
      }
      
      return {
        query,
        totalChunks: result.rows.length,
        results: groupedResults
      };
      
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
