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
    try {
      const response = await axios.post<PredictionResult>(`${API_URL}/predict`, request, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error in getPrediction:', error);
      throw error;
    }
  });
};

// Get API connection statuses
export const getApiStatus = async (): Promise<ApiStatus[]> => {
  return handleApiRequest(async () => {
    try {
      const response = await axios.get<ApiStatus[]>(`${API_URL}/status`);
      return response.data;
    } catch (error) {
      console.error('Error in getApiStatus:', error);
      // Return a fallback status array instead of throwing
      return [
        { name: 'DeepSeek AI', status: 'error', message: 'Failed to connect' },
        { name: 'Speech Recognition', status: 'connected' },
        { name: 'Text-to-Speech', status: 'connected' }
      ];
    }
  });
};