import express from 'express';
import multer from 'multer';
import { ttsSttService } from '../services/ttsSttService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for audio file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit for audio files
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'), false);
    }
  },
});

// Get TTS/STT service status
router.get('/status', async (req, res) => {
  try {
    const status = ttsSttService.getServiceStatus();
    res.json({
      success: true,
      status
    });
  } catch (error) {
    console.error('❌ Status check failed:', error);
    res.status(500).json({
      error: 'Failed to get service status',
      message: error.message
    });
  }
});

// Get available voices
router.get('/voices', async (req, res) => {
  try {
    const result = await ttsSttService.getAvailableVoices();
    
    if (result.success) {
      res.json({
        success: true,
        voices: result.voices
      });
    } else {
      res.status(500).json({
        error: 'Failed to get voices',
        message: result.error
      });
    }
  } catch (error) {
    console.error('❌ Get voices failed:', error);
    res.status(500).json({
      error: 'Failed to get voices',
      message: error.message
    });
  }
});

// Get voice details
router.get('/voices/:voiceId', async (req, res) => {
  try {
    const { voiceId } = req.params;
    const result = await ttsSttService.getVoiceDetails(voiceId);
    
    if (result.success) {
      res.json({
        success: true,
        voice: result.voice
      });
    } else {
      res.status(404).json({
        error: 'Voice not found',
        message: result.error
      });
    }
  } catch (error) {
    console.error('❌ Get voice details failed:', error);
    res.status(500).json({
      error: 'Failed to get voice details',
      message: error.message
    });
  }
});

// Text-to-Speech
router.post('/tts', authenticateToken, async (req, res) => {
  try {
    const { text, voiceId, options } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    const result = await ttsSttService.textToSpeech(text, voiceId, options);
    
    if (result.success) {
      // Set headers for audio response
      res.set({
        'Content-Type': result.contentType,
        'Content-Length': result.audioBuffer.length,
        'Content-Disposition': 'attachment; filename="teknotassen-tts.mp3"'
      });
      
      res.send(result.audioBuffer);
    } else {
      res.status(500).json({
        error: 'TTS failed',
        message: result.error
      });
    }
  } catch (error) {
    console.error('❌ TTS failed:', error);
    res.status(500).json({
      error: 'Failed to generate speech',
      message: error.message
    });
  }
});

// Speech-to-Text
router.post('/stt', authenticateToken, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Audio file is required' });
    }
    
    const { options } = req.body;
    const audioBuffer = req.file.buffer;
    
    const result = await ttsSttService.speechToText(audioBuffer, options);
    
    if (result.success) {
      res.json({
        success: true,
        transcription: result.transcription,
        language: result.language,
        confidence: result.confidence,
        speakerLabels: result.speakerLabels
      });
    } else {
      res.status(500).json({
        error: 'STT failed',
        message: result.error
      });
    }
  } catch (error) {
    console.error('❌ STT failed:', error);
    res.status(500).json({
      error: 'Failed to transcribe audio',
      message: error.message
    });
  }
});

// Test Norwegian TTS
router.get('/test-norwegian', async (req, res) => {
  try {
    const result = await ttsSttService.testNorwegianTTS();
    
    if (result.success) {
      // Set headers for audio response
      res.set({
        'Content-Type': result.contentType,
        'Content-Length': result.audioBuffer.length,
        'Content-Disposition': 'attachment; filename="teknotassen-norsk-test.mp3"'
      });
      
      res.send(result.audioBuffer);
    } else {
      res.status(500).json({
        error: 'Test TTS failed',
        message: result.error
      });
    }
  } catch (error) {
    console.error('❌ Test TTS failed:', error);
    res.status(500).json({
      error: 'Failed to generate test speech',
      message: error.message
    });
  }
});

// Chat with voice input/output
router.post('/chat-voice', authenticateToken, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Audio file is required' });
    }
    
    const { role, technology } = req.body;
    const audioBuffer = req.file.buffer;
    
    // First, transcribe the audio
    const sttResult = await ttsSttService.speechToText(audioBuffer);
    
    if (!sttResult.success) {
      return res.status(500).json({
        error: 'Speech recognition failed',
        message: sttResult.error
      });
    }
    
    // TODO: Integrate with RAG chat service
    // For now, return the transcription and a mock response
    const mockResponse = `Hei! Jeg hørte at du sa: "${sttResult.transcription}". Som TeknoTassen kan jeg hjelpe deg med dette! Null stress - dette fikser vi sammen! 🤖✨`;
    
    // Generate speech response
    const ttsResult = await ttsSttService.textToSpeech(mockResponse);
    
    if (ttsResult.success) {
      // Return both transcription and audio response
      res.set({
        'Content-Type': 'application/json',
        'X-Transcription': sttResult.transcription,
        'X-Language': sttResult.language
      });
      
      res.json({
        success: true,
        transcription: sttResult.transcription,
        response: mockResponse,
        audioUrl: `/api/tts-stt/chat-voice-audio/${Date.now()}`, // Mock URL
        language: sttResult.language,
        confidence: sttResult.confidence
      });
    } else {
      res.status(500).json({
        error: 'Voice response generation failed',
        message: ttsResult.error
      });
    }
  } catch (error) {
    console.error('❌ Voice chat failed:', error);
    res.status(500).json({
      error: 'Failed to process voice chat',
      message: error.message
    });
  }
});

export default router;
