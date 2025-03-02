import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import OpenAI from 'openai';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize OpenAI client with DeepSeek configuration
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com/v1',
  apiKey: process.env.DEEPSEEK_API_KEY || 'your-deepseek-api-key'
});

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// Enable CORS for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// Rate limiting middleware
const rateLimiter = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // limit each IP to 10 requests per windowMs
  requestCounts: new Map(),
  resetTime: Date.now() + 60 * 1000,
  
  check: function(req, res, next) {
    const ip = req.ip;
    if (Date.now() > this.resetTime) {
      this.requestCounts.clear();
      this.resetTime = Date.now() + this.windowMs;
    }
    const currentCount = this.requestCounts.get(ip) || 0;
    if (currentCount >= this.maxRequests) {
      return res.status(429).json({
        error: 'Too many requests, please try again later.',
        retryAfter: Math.ceil((this.resetTime - Date.now()) / 1000)
      });
    }
    this.requestCounts.set(ip, currentCount + 1);
    next();
  }
};

// ----------------------------
// Helper: Call DeepSeek API using OpenAI client
// ----------------------------
const generateDeepSeekResponse = async (prompt) => {
  try {
    console.log("Calling DeepSeek API with prompt:", prompt.substring(0, 100) + "...");
    
    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "You are an expert AI assistant specializing in data analysis and predictions." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1024
    });
    
    if (completion.choices && completion.choices.length > 0) {
      return completion.choices[0].message.content;
    }
    
    throw new Error("Unexpected response format from DeepSeek API");
  } catch (error) {
    console.error("Error calling DeepSeek API:", error);
    
    // If API key is not set or invalid, return mock data
    if (process.env.DEEPSEEK_API_KEY === "your-deepseek-api-key" || 
        error.message.includes("API key")) {
      console.log("Using mock response due to API key issue");
      return mockDeepSeekResponse(prompt);
    }
    
    throw error;
  }
};

// Mock response generator for development without API key
const mockDeepSeekResponse = (prompt) => {
  console.log("Using mock DeepSeek response for prompt:", prompt.substring(0, 100) + "...");
  
  // If prompt is asking for JSON
  if (prompt.includes("JSON format") || prompt.includes("valid JSON")) {
    if (prompt.includes("prediction")) {
      return `{
        "prediction": "Based on current trends and data analysis, the prediction indicates significant growth potential in this area over the specified timeframe.",
        "dataPoints": [
          "Historical data shows a consistent upward trend over the past 5 years",
          "Recent market indicators suggest favorable conditions for expansion",
          "Comparable sectors have shown similar patterns of growth",
          "Expert consensus aligns with this positive outlook",
          "Technological advancements are likely to accelerate progress"
        ],
        "variables": [
          "Regulatory changes could impact the trajectory",
          "Market competition might intensify, affecting growth rates",
          "Economic stability is a key factor for sustained progress",
          "Consumer behavior shifts could alter demand patterns",
          "Global supply chain resilience will influence outcomes"
        ],
        "historicalPatterns": [
          "Similar conditions in 2018-2019 led to substantial growth",
          "Previous innovation cycles resulted in market expansion",
          "Past economic recoveries showed comparable trajectories"
        ],
        "alternativeScenarios": [
          "A conservative scenario shows moderate growth with slower adoption",
          "An aggressive scenario indicates potential for exponential growth if key barriers are removed",
          "A disruptive scenario suggests possible market transformation with new entrants"
        ]
      }`;
    }
    
    // For confidence score request
    if (prompt.includes("confidence score")) {
      return "75";
    }
    
    // For trend direction request
    if (prompt.includes("trend is")) {
      return "up";
    }
  }
  
  // Default response
  return "Based on the available data and analysis, the outlook appears positive with strong indicators supporting growth in the specified timeframe.";
};

// ----------------------------
// AI Prediction Data Generation
// ----------------------------

const formatTimeframe = (timeframe) => {
  switch (timeframe) {
    case '1week': return 'one week';
    case '1month': return 'one month';
    case '3months': return 'three months';
    case '6months': return 'six months';
    case '1year': return 'one year';
    case '5years': return 'five years';
    default: return 'the coming period';
  }
};

/**
 * Uses DeepSeek API to generate prediction details.
 * Expects the model to return valid JSON with the following keys:
 *   prediction, dataPoints (array), variables (array),
 *   historicalPatterns (array), alternativeScenarios (array)
 */
const generatePredictionData = async (request) => {
  const { topic, category, timeframe, context } = request;
  
  // Create a detailed prompt for DeepSeek model
  const prompt = `You are an expert predictor in the domain of ${category}. 
  
I need a detailed prediction about "${topic}" over the next ${formatTimeframe(timeframe)}.
${context ? `Additional context: ${context}` : ''}

Please provide your response in the following JSON format:
{
  "prediction": "A detailed prediction statement about the topic",
  "dataPoints": [
    "Supporting data point 1",
    "Supporting data point 2",
    "Supporting data point 3",
    "Supporting data point 4",
    "Supporting data point 5"
  ],
  "variables": [
    "Key factor 1 that may affect the outcome",
    "Key factor 2 that may affect the outcome",
    "Key factor 3 that may affect the outcome",
    "Key factor 4 that may affect the outcome",
    "Key factor 5 that may affect the outcome"
  ],
  "historicalPatterns": [
    "Historical pattern 1 relevant to this topic",
    "Historical pattern 2 relevant to this topic",
    "Historical pattern 3 relevant to this topic"
  ],
  "alternativeScenarios": [
    "Alternative scenario 1 for the outcome",
    "Alternative scenario 2 for the outcome",
    "Alternative scenario 3 for the outcome"
  ]
}

Ensure your response is ONLY valid JSON with no additional text before or after.`;

  try {
    // Get the AI-generated response
    const aiText = await generateDeepSeekResponse(prompt);
    
    // Extract the JSON part from the response
    let jsonStr = aiText;
    
    // If the response contains more than just JSON, extract the JSON part
    if (!aiText.trim().startsWith('{')) {
      const jsonStartIndex = aiText.indexOf('{');
      const jsonEndIndex = aiText.lastIndexOf('}') + 1;
      
      if (jsonStartIndex >= 0 && jsonEndIndex > jsonStartIndex) {
        jsonStr = aiText.substring(jsonStartIndex, jsonEndIndex);
      } else {
        throw new Error("Could not extract valid JSON from AI response");
      }
    }
    
    // Parse the JSON
    const aiData = JSON.parse(jsonStr);
    
    // Generate confidence and trend using DeepSeek for more accurate assessment
    const confidencePrompt = `Based on the prediction: "${aiData.prediction}" for the topic "${topic}" in the ${category} domain, 
    assign a confidence score between 50 and 95 percent. Only respond with a single number.`;
    
    const trendPrompt = `Based on the prediction: "${aiData.prediction}" for the topic "${topic}" in the ${category} domain, 
    determine if the trend is "up", "down", or "neutral". Only respond with one of these three words.`;
    
    // Get confidence and trend in parallel
    const [confidenceText, trendText] = await Promise.all([
      generateDeepSeekResponse(confidencePrompt),
      generateDeepSeekResponse(trendPrompt)
    ]);
    
    // Extract confidence value
    const confidenceMatch = confidenceText.match(/\d+/);
    const confidence = confidenceMatch 
      ? Math.min(95, Math.max(50, parseInt(confidenceMatch[0]))) 
      : Math.floor(Math.random() * 46) + 50;
    
    // Extract trend value
    let trend = 'neutral';
    if (trendText.toLowerCase().includes('up')) {
      trend = 'up';
    } else if (trendText.toLowerCase().includes('down')) {
      trend = 'down';
    }
    
    // Format the timestamp
    const now = new Date();
    const lastUpdated = now.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
    
    // Return the complete prediction data
    return {
      topic,
      category,
      timeframe,
      prediction: aiData.prediction,
      confidence,
      trend,
      dataPoints: aiData.dataPoints,
      variables: aiData.variables,
      historicalPatterns: aiData.historicalPatterns,
      alternativeScenarios: aiData.alternativeScenarios,
      lastUpdated
    };
  } catch (err) {
    console.error("Error generating AI prediction data:", err);
    throw err;
  }
};

// ----------------------------
// Text-to-Speech via DeepSeek API
// ----------------------------
const generateSpeech = async (text) => {
  try {
    // For now, we'll return a placeholder URL since DeepSeek doesn't have a TTS API
    // In a production environment, you would integrate with a TTS service
    return {
      audioUrl: `http://api.voicerss.org/?key=${process.env.VOICERSS_API_KEY || 'demo-key'}&hl=en-us&src=${encodeURIComponent(text)}`,
      format: 'mp3'
    };
  } catch (error) {
    console.error("Error generating speech:", error);
    throw error;
  }
};

// ----------------------------
// Endpoints
// ----------------------------

// General Prediction Endpoint using AI
app.post('/api/predict', rateLimiter.check.bind(rateLimiter), async (req, res) => {
  try {
    const predictionRequest = req.body;
    if (!predictionRequest.topic) {
      return res.status(400).json({ error: 'Prediction topic is required' });
    }
    const predictionData = await generatePredictionData(predictionRequest);
    res.json(predictionData);
  } catch (error) {
    console.error('Error generating prediction:', error);
    res.status(500).json({ error: 'Failed to generate prediction' });
  }
});

// Text-to-Speech Endpoint
app.post('/api/text-to-speech', rateLimiter.check.bind(rateLimiter), async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    // For now, we'll use a placeholder response
    // In a production environment, you would integrate with a TTS service
    res.json({
      audioUrl: `http://api.voicerss.org/?key=${process.env.VOICERSS_API_KEY || 'demo-key'}&hl=en-us&src=${encodeURIComponent(text)}`,
      format: 'mp3'
    });
  } catch (error) {
    console.error('Error generating speech:', error);
    res.status(500).json({ error: 'Failed to generate speech' });
  }
});

// API Status Endpoint
app.get('/api/status', async (req, res) => {
  // Check DeepSeek API
  let deepseekStatus = 'unknown';
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey || apiKey === 'your-deepseek-api-key') {
      deepseekStatus = 'disabled';
    } else {
      // Make a simple test call to DeepSeek API
      try {
        await openai.chat.completions.create({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: "Hello" }
          ],
          max_tokens: 5
        });
        deepseekStatus = 'connected';
      } catch (error) {
        console.error("DeepSeek API test error:", error);
        deepseekStatus = 'error';
      }
    }
  } catch (error) {
    console.error("Error checking DeepSeek API status:", error);
    deepseekStatus = 'error';
  }
  
  // Speech recognition status (browser-based)
  const speechRecognitionStatus = process.env.SPEECH_RECOGNITION_ENABLED === 'true' ? 'connected' : 'disabled';
  
  res.json([
    { name: 'DeepSeek AI', status: deepseekStatus },
    { name: 'Speech Recognition', status: speechRecognitionStatus },
    { name: 'Text-to-Speech', status: process.env.TEXT_TO_SPEECH_ENABLED === 'true' ? 'connected' : 'disabled' }
  ]);
});

// Catch-all route to serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`- Frontend: http://localhost:${PORT}`);
  console.log(`- API: http://localhost:${PORT}/api`);
});