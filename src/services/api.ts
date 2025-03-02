import axios from 'axios';
import { PredictionRequest, PredictionResult, ApiStatus } from '../types';

const API_URL = 'http://localhost:3001/api';

// Rate limiting configuration
const MAX_REQUESTS_PER_MINUTE = 10;
let requestCount = 0;
let resetTime = Date.now() + 60000;

// Error handling wrapper
const handleApiRequest = async <T>(requestFn: () => Promise<T>): Promise<T> => {
  try {
    // Check rate limiting
    if (Date.now() > resetTime) {
      requestCount = 0;
      resetTime = Date.now() + 60000;
    }
    
    if (requestCount >= MAX_REQUESTS_PER_MINUTE) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    requestCount++;
    
    // Execute the request
    return await requestFn();
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(`Server error: ${error.response.status} - ${error.response.data.error || 'Unknown error'}`);
      } else if (error.request) {
        throw new Error('No response from server. Please check your connection.');
      } else {
        throw new Error(`Request error: ${error.message}`);
      }
    }
    console.error('API request error:', error instanceof Error ? error.message : 'Unknown error');
    throw new Error('Failed to process request. Please try again.');
  }
};

// Get prediction from the backend prediction API
export const getPrediction = async (request: PredictionRequest): Promise<PredictionResult> => {
  return handleApiRequest(async () => {
    const response = await axios.post<PredictionResult>(`${API_URL}/predict`, request);
    return response.data;
  });
};

// Generate speech (text-to-speech) using Voice RSS API
export const generateSpeech = async (text: string): Promise<string> => {
  return handleApiRequest(async () => {
    const apiKey = process.env.VOICERSS_API_KEY;
    if (!apiKey) {
      throw new Error('TTS API key not configured');
    }
    // Voice RSS uses GET requests with query parameters.
    // Build the URL with the appropriate parameters.
    const params = {
      key: apiKey,
      hl: 'en-us',
      src: text
    };
    // Optionally, you could perform a GET request here if you want to test connectivity:
    // const response = await axios.get('http://api.voicerss.org/', { params, responseType: 'text' });
    // For simplicity, we just return the URL which can be used as the audio source.
    const audioUrl = `http://api.voicerss.org/?key=${params.key}&hl=${params.hl}&src=${encodeURIComponent(params.src)}`;
    return audioUrl;
  });
};

// Transcribe speech (speech-to-text) using Wit.ai
export const transcribeSpeech = async (audioBlob: Blob): Promise<string> => {
  return handleApiRequest(async () => {
    const witToken = process.env.WIT_AI_TOKEN;
    if (!witToken) {
      throw new Error('Wit.ai API token not configured');
    }
    // Convert the Blob into an ArrayBuffer
    const arrayBuffer = await audioBlob.arrayBuffer();
    const headers = {
      'Authorization': `Bearer ${witToken}`,
      'Content-Type': 'audio/wav' // Ensure your audioBlob is in a supported format
    };
    const response = await axios.post('https://api.wit.ai/speech', arrayBuffer, { headers });
    // Wit.ai returns a JSON object with a "text" field containing the transcription.
    return response.data.text || 'Transcription unavailable';
  });
};

// Get API connection statuses by calling real endpoints/configuration checks
export const getApiStatus = async (): Promise<ApiStatus[]> => {
  const statuses: ApiStatus[] = [];
  
  // Check Prediction API (your backend)
  try {
    await axios.get(`${API_URL}/status`);
    statuses.push({ name: 'Prediction API', status: 'connected' });
  } catch (error) {
    statuses.push({ name: 'Prediction API', status: 'error', message: 'Not reachable' });
  }
  
  // Check Voice RSS API by making a test call
  try {
    const apiKey = process.env.VOICERSS_API_KEY;
    if (!apiKey) {
      statuses.push({ name: 'Voice RSS TTS', status: 'disabled', message: 'API key not configured' });
    } else {
      const params = { key: apiKey, hl: 'en-us', src: 'test' };
      const response = await axios.get('http://api.voicerss.org/', { params, responseType: 'text' });
      if (response.data && !response.data.includes('ERROR')) {
        statuses.push({ name: 'Voice RSS TTS', status: 'connected' });
      } else {
        statuses.push({ name: 'Voice RSS TTS', status: 'error', message: 'Test failed' });
      }
    }
  } catch (error) {
    statuses.push({ name: 'Voice RSS TTS', status: 'error', message: 'Not reachable' });
  }
  
  // Check Wit.ai API configuration
  try {
    const witToken = process.env.WIT_AI_TOKEN;
    if (!witToken) {
      statuses.push({ name: 'Wit.ai Speech-to-Text', status: 'disabled', message: 'Token not configured' });
    } else {
      statuses.push({ name: 'Wit.ai Speech-to-Text', status: 'connected' });
    }
  } catch (error) {
    statuses.push({ name: 'Wit.ai Speech-to-Text', status: 'error', message: 'Not reachable' });
  }
  
  return statuses;
};
