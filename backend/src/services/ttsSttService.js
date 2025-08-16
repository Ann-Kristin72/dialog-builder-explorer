import axios from 'axios';
import FormData from 'form-data';
import dotenv from 'dotenv';

dotenv.config();

class TTSSTTService {
  constructor() {
    this.elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
    this.elevenLabsBaseUrl = 'https://api.elevenlabs.io/v1';
    
    if (!this.elevenLabsApiKey) {
      console.warn('⚠️ ElevenLabs API key not configured - TTS/STT features will be disabled');
    }
  }

  // Text-to-Speech using ElevenLabs
  async textToSpeech(text, voiceId = '21m00Tcm4TlvDq8ikWAM', options = {}) {
    try {
      if (!this.elevenLabsApiKey) {
        throw new Error('ElevenLabs API key not configured');
      }

      const defaultOptions = {
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true
        }
      };

      const requestOptions = {
        ...defaultOptions,
        ...options,
        voice_settings: {
          ...defaultOptions.voice_settings,
          ...options.voice_settings
        }
      };

      const response = await axios.post(
        `${this.elevenLabsBaseUrl}/text-to-speech/${voiceId}`,
        {
          text,
          model_id: requestOptions.model_id,
          voice_settings: requestOptions.voice_settings
        },
        {
          headers: {
            'Accept': 'audio/mpeg',
            'xi-api-key': this.elevenLabsApiKey,
            'Content-Type': 'application/json'
          },
          responseType: 'arraybuffer'
        }
      );

      return {
        success: true,
        audioBuffer: Buffer.from(response.data),
        contentType: 'audio/mpeg',
        text,
        voiceId,
        options: requestOptions
      };

    } catch (error) {
      console.error('❌ TTS Error:', error.message);
      return {
        success: false,
        error: error.message,
        text
      };
    }
  }

  // Speech-to-Text using ElevenLabs Scribe
  async speechToText(audioBuffer, options = {}) {
    try {
      if (!this.elevenLabsApiKey) {
        throw new Error('ElevenLabs API key not configured');
      }

      const defaultOptions = {
        model_id: 'eleven_multilingual_v2',
        language_detection: true,
        speaker_labels: true
      };

      const requestOptions = {
        ...defaultOptions,
        ...options
      };

      // Create form data for file upload
      const formData = new FormData();
      formData.append('audio', audioBuffer, {
        filename: 'audio.wav',
        contentType: 'audio/wav'
      });
      formData.append('model_id', requestOptions.model_id);
      formData.append('language_detection', requestOptions.language_detection);
      formData.append('speaker_labels', requestOptions.speaker_labels);

      const response = await axios.post(
        `${this.elevenLabsBaseUrl}/speech-to-text`,
        formData,
        {
          headers: {
            'xi-api-key': this.elevenLabsApiKey,
            ...formData.getHeaders()
          }
        }
      );

      return {
        success: true,
        transcription: response.data.text,
        language: response.data.language,
        speakerLabels: response.data.speaker_labels,
        confidence: response.data.confidence,
        options: requestOptions
      };

    } catch (error) {
      console.error('❌ STT Error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get available voices from ElevenLabs
  async getAvailableVoices() {
    try {
      if (!this.elevenLabsApiKey) {
        throw new Error('ElevenLabs API key not configured');
      }

      const response = await axios.get(
        `${this.elevenLabsBaseUrl}/voices`,
        {
          headers: {
            'xi-api-key': this.elevenLabsApiKey
          }
        }
      );

      // Filter for Norwegian and English voices
      const voices = response.data.voices.filter(voice => 
        voice.labels.language === 'norwegian' || 
        voice.labels.language === 'english' ||
        voice.labels.language === 'norsk'
      );

      return {
        success: true,
        voices: voices.map(voice => ({
          id: voice.voice_id,
          name: voice.name,
          language: voice.labels.language,
          description: voice.labels.description || '',
          category: voice.category,
          sampleUrl: voice.preview_url
        }))
      };

    } catch (error) {
      console.error('❌ Get Voices Error:', error.message);
      return {
        success: false,
        error: error.message,
        voices: []
      };
    }
  }

  // Get voice details by ID
  async getVoiceDetails(voiceId) {
    try {
      if (!this.elevenLabsApiKey) {
        throw new Error('ElevenLabs API key not configured');
      }

      const response = await axios.get(
        `${this.elevenLabsBaseUrl}/voices/${voiceId}`,
        {
          headers: {
            'xi-api-key': this.elevenLabsApiKey
          }
        }
      );

      return {
        success: true,
        voice: {
          id: response.data.voice_id,
          name: response.data.name,
          language: response.data.labels.language,
          description: response.data.labels.description || '',
          category: response.data.category,
          sampleUrl: response.data.preview_url,
          settings: response.data.settings
        }
      };

    } catch (error) {
      console.error('❌ Get Voice Details Error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Test TTS with Norwegian text
  async testNorwegianTTS() {
    const norwegianText = "Hei! Jeg er TeknoTassen, din vennlige assistent for velferdsteknologi. Jeg kan hjelpe deg med digitale nattilsyn, HEPRO Respons og mye mer. Null stress - dette fikser vi sammen! 🤖✨";
    
    return await this.textToSpeech(norwegianText, '21m00Tcm4TlvDq8ikWAM', {
      voice_settings: {
        stability: 0.7,
        similarity_boost: 0.8,
        style: 0.2,
        use_speaker_boost: true
      }
    });
  }

  // Get service status and configuration
  getServiceStatus() {
    return {
      configured: !!this.elevenLabsApiKey,
      provider: 'ElevenLabs',
      features: {
        tts: !!this.elevenLabsApiKey,
        stt: !!this.elevenLabsApiKey,
        voices: !!this.elevenLabsApiKey
      },
      models: {
        tts: 'eleven_multilingual_v2',
        stt: 'eleven_multilingual_v2'
      },
      languages: ['Norwegian', 'English', 'Multilingual'],
      pricing: {
        tts: '$5 per 1M characters',
        stt: '$0.24 per minute'
      }
    };
  }
}

export const ttsSttService = new TTSSTTService();
export default ttsSttService;
