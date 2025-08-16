import express from 'express';
import multer from 'multer';
import { EmbeddingService } from '../services/embeddingService.js';
import { RAGChatService } from '../services/ragChatService.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { azureStorageService } from '../services/azureStorageService.js';
import { z } from 'zod';

const router = express.Router();

// Multer configuration for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Sjekk både MIME-type og filnavn
    const isMarkdown = file.mimetype === 'text/markdown' || 
                      file.mimetype === 'text/plain' ||
                      file.originalname.endsWith('.md') ||
                      file.originalname.endsWith('.txt');
    
    if (isMarkdown) {
      cb(null, true);
    } else {
      cb(new Error('Only markdown (.md) and text (.txt) files are allowed'), false);
    }
  },
});

// Validation schemas
const courseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  technology: z.string().min(1, 'Technology is required'),
  tags: z.array(z.string()).optional(),
  content_md: z.string().min(1, 'Content is required'),
});

// Upload course from markdown file (requires authentication)
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const content = req.file.buffer.toString('utf-8');
    
    // Generate slug from title
    const title = req.body.title || req.file.originalname.replace(/\.[^/.]+$/, '');
    console.log('Debug - title:', title, 'req.body:', req.body, 'req.file:', req.file.originalname);
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const courseData = {
      title,
      slug,
      technology: req.body.technology || 'Generell',
      tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
      content_md: content,
      uploaded_by: req.user.id, // Use authenticated user's ID
    };

    // Validate course data
    const validatedData = courseSchema.parse(courseData);

    // Process course with embeddings
    const result = await EmbeddingService.processCourse(validatedData);

    res.json({
      success: true,
      message: 'Course uploaded and processed successfully',
      courseId: result.courseId,
      chunkCount: result.chunkCount,
    });

  } catch (error) {
    console.error('Error uploading course:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.errors 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to upload course',
      message: error.message 
    });
  }
});

// Get all courses
router.get('/', async (req, res) => {
  try {
    const courses = await EmbeddingService.getAllCourses();
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ 
      error: 'Failed to fetch courses',
      message: error.message 
    });
  }
});

// Get course by ID
router.get('/:id', async (req, res) => {
  try {
    const course = await EmbeddingService.getCourseById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    res.json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ 
      error: 'Failed to fetch course',
      message: error.message 
    });
  }
});

// Delete course
router.delete('/:id', async (req, res) => {
  try {
    await EmbeddingService.deleteCourse(req.params.id);
    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ 
      error: 'Failed to delete course',
      message: error.message 
    });
  }
});

// RAG Chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message, role, technology } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const result = await RAGChatService.chat(message, role, technology);
    res.json(result);
    
  } catch (error) {
    console.error('Error in RAG chat:', error);
    res.status(500).json({ 
      error: 'Chat failed',
      message: error.message 
    });
  }
});

// Get chat suggestions
router.get('/chat/suggestions', async (req, res) => {
  try {
    const { technology } = req.query;
    const suggestions = await RAGChatService.getChatSuggestions(technology);
    res.json(suggestions);
  } catch (error) {
    console.error('Error getting suggestions:', error);
    res.status(500).json({ 
      error: 'Failed to get suggestions',
      message: error.message 
    });
  }
});

// Azure Storage Routes
// Upload course file to Azure Blob Storage
router.post('/azure/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileName = req.body.fileName || req.file.originalname;
    const fileBuffer = req.file.buffer;
    const contentType = req.file.mimetype || 'text/markdown';

    // Upload to Azure Blob Storage
    const result = await azureStorageService.uploadCourseFile(fileName, fileBuffer, contentType);

    res.json({
      success: true,
      message: 'Course file uploaded to Azure Storage successfully',
      blobUrl: result.url,
      blobName: result.blobName,
      size: result.size
    });

  } catch (error) {
    console.error('Error uploading to Azure Storage:', error);
    res.status(500).json({ 
      error: 'Failed to upload to Azure Storage',
      message: error.message 
    });
  }
});

// Get course file from Azure Blob Storage
router.get('/azure/file/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;
    const fileData = await azureStorageService.getCourseFile(fileName);
    
    res.set('Content-Type', fileData.contentType);
    res.set('Content-Length', fileData.size);
    res.send(fileData.content);
    
  } catch (error) {
    console.error('Error getting file from Azure Storage:', error);
    res.status(500).json({ 
      error: 'Failed to get file from Azure Storage',
      message: error.message 
    });
  }
});

// List all course files in Azure Storage
router.get('/azure/files', async (req, res) => {
  try {
    const files = await azureStorageService.listCourseFiles();
    res.json(files);
  } catch (error) {
    console.error('Error listing Azure Storage files:', error);
    res.status(500).json({ 
      error: 'Failed to list Azure Storage files',
      message: error.message 
    });
  }
});

// Delete course file from Azure Storage
router.delete('/azure/file/:fileName', authenticateToken, async (req, res) => {
  try {
    const { fileName } = req.params;
    await azureStorageService.deleteCourseFile(fileName);
    
    res.json({
      success: true,
      message: 'Course file deleted from Azure Storage successfully'
    });
    
  } catch (error) {
    console.error('Error deleting from Azure Storage:', error);
    res.status(500).json({ 
      error: 'Failed to delete from Azure Storage',
      message: error.message 
    });
  }
});

// Test Azure PostgreSQL connection
router.get('/azure/test-db', async (req, res) => {
  try {
    const { getPool } = await import('../utils/database.js');
    const pool = getPool();
    
    // Test basic query
    const result = await pool.query('SELECT NOW() as current_time, version() as postgres_version');
    
    // Test pgvector extension
    const vectorResult = await pool.query('SELECT * FROM pg_extension WHERE extname = $1', ['vector']);
    
    // Test current user and role
    const userResult = await pool.query('SELECT current_user, session_user, current_database()');
    
    // Test table structure
    const tableResult = await pool.query(`
      SELECT table_name, column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name IN ('courses', 'course_chunks')
      ORDER BY table_name, ordinal_position
    `);
    
    res.json({
      success: true,
      message: 'Azure PostgreSQL connection test successful',
      database: {
        currentTime: result.rows[0].current_time,
        postgresVersion: result.rows[0].postgres_version,
        pgvectorAvailable: vectorResult.rows.length > 0,
        currentUser: userResult.rows[0].current_user,
        sessionUser: userResult.rows[0].session_user,
        database: userResult.rows[0].current_database,
        tableStructure: tableResult.rows
      }
    });
    
  } catch (error) {
    console.error('❌ Azure PostgreSQL test failed:', error);
    res.status(500).json({ 
      error: 'Azure PostgreSQL test failed',
      message: error.message 
    });
  }
});

// Test role-based access control
router.get('/azure/test-roles', async (req, res) => {
  try {
    const { getPool } = await import('../utils/database.js');
    const pool = getPool();
    
    // Test current user permissions
    const permissionsResult = await pool.query(`
      SELECT 
        table_name,
        privilege_type,
        is_grantable
      FROM information_schema.table_privileges 
      WHERE grantee = current_user
      AND table_name IN ('courses', 'course_chunks')
      ORDER BY table_name, privilege_type
    `);
    
    // Test if we can create roles (for app user)
    let canCreateRoles = false;
    try {
      const roleResult = await pool.query(`
        SELECT rolcreaterole 
        FROM pg_roles 
        WHERE rolname = current_user
      `);
      canCreateRoles = roleResult.rows[0]?.rolcreaterole || false;
    } catch (error) {
      console.log('Could not check role creation permissions:', error.message);
    }
    
    res.json({
      success: true,
      message: 'Role-based access control test completed',
      currentUser: {
        permissions: permissionsResult.rows,
        canCreateRoles: canCreateRoles
      },
      recommendations: {
        useAppUser: 'teknotassen_app should be used for application operations',
        adminUser: 'ttadmin should only be used for database administration',
        roleCreation: canCreateRoles ? 'User can create read-only roles' : 'User cannot create roles'
      }
    });
    
  } catch (error) {
    console.error('❌ Role-based access control test failed:', error);
    res.status(500).json({ 
      error: 'Role-based access control test failed',
      message: error.message 
    });
  }
});

// Get technology overview
router.get('/technology/overview', async (req, res) => {
  try {
    const overview = await RAGChatService.getTechnologyOverview();
    res.json(overview);
  } catch (error) {
    console.error('Error getting technology overview:', error);
    res.status(500).json({ 
      error: 'Failed to get technology overview',
      message: error.message 
    });
  }
});

export default router;
