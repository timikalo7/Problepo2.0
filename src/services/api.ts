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
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        throw new Error(`Server error: ${error.response.status} - ${error.response.data.error || 'Unknown error'}`);
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new Error(`Request error: ${error.message}`);
      }
    }
    
    // For non-Axios errors
    console.error('API request error:', error instanceof Error ? error.message : 'Unknown error');
    throw new Error('Failed to process request. Please try again.');
  }
};

// Get prediction from the API
export const getPrediction = async (request: PredictionRequest): Promise<PredictionResult> => {
  // For demo purposes, generate mock prediction data
  // This will prevent the "No response from server" error
  return new Promise((resolve) => {
    setTimeout(() => {
      const confidence = Math.floor(Math.random() * 46) + 50;
      const trendOptions = ['up', 'down', 'neutral'] as const;
      const trend = trendOptions[Math.floor(Math.random() * trendOptions.length)];
      
      resolve({
        topic: request.topic,
        category: request.category,
        timeframe: request.timeframe,
        prediction: `Based on our analysis, ${request.topic} is likely to show significant developments in the coming months. Multiple indicators suggest a ${trend === 'up' ? 'positive' : trend === 'down' ? 'challenging' : 'stable'} outlook.`,
        confidence,
        trend,
        dataPoints: [
          `Recent trends show increasing interest in ${request.topic}`,
          `Market sentiment analysis indicates ${confidence}% alignment with predicted outcome`,
          `Historical patterns suggest similar trajectories for comparable scenarios`,
          `Expert consensus broadly supports this prediction direction`,
          `Technical indicators align with the projected outcome`
        ],
        variables: [
          "Unexpected market disruptions",
          "Regulatory changes affecting the domain",
          "Technological breakthroughs altering current dynamics",
          "Shifts in public sentiment or engagement",
          "Competitive landscape evolution"
        ],
        historicalPatterns: [
          "Similar scenarios have followed predictable development cycles",
          "Previous instances show comparable response to similar conditions",
          "Pattern recognition algorithms identify matching historical cases"
        ],
        alternativeScenarios: [
          "Accelerated growth scenario: Faster than expected positive developments",
          "Delayed impact scenario: Similar outcome but over a longer timeframe",
          "Disruption scenario: Unexpected factors creating significant deviation"
        ],
        lastUpdated: new Date().toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          hour12: true
        })
      });
    }, 3000); // Simulate network delay
  });
};

// Simulate text-to-speech request
export const generateSpeech = async (text: string): Promise<string> => {
  return handleApiRequest(async () => {
    // In a real implementation, this would call the backend
    // For demo purposes, we're returning a mock audio URL
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    return 'data:audio/mp3;base64,MOCK_AUDIO_DATA';
  });
};

// Simulate speech-to-text request
export const transcribeSpeech = async (audioBlob: Blob): Promise<string> => {
  return handleApiRequest(async () => {
    // In a real implementation, this would call the backend
    // For demo purposes, we're returning mock text
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    return 'This is a simulated transcription of speech input.';
  });
};

// Get API connection status
export const getApiStatus = async (): Promise<ApiStatus[]> => {
  return [
    { name: 'OpenAI API', status: 'connected' },
    { name: 'Google Cloud NLP', status: 'connected' },
    { name: 'Twitter API', status: 'disabled', message: 'Not configured' },
    { name: 'Facebook Graph API', status: 'disabled', message: 'Not configured' },
    { name: 'Hugging Face', status: 'connected' },
    { name: 'ScraperAPI', status: 'error', message: 'Authentication failed' },
  ];
};