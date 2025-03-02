import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import fetch from 'node-fetch';
import natural from 'natural';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

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

// Initialize sentiment analyzer
const analyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
const tokenizer = new natural.WordTokenizer();

// Rate limiting middleware
const rateLimiter = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // limit each IP to 10 requests per windowMs
  requestCounts: new Map(),
  resetTime: Date.now() + 60 * 1000,

  check: function (req, res, next) {
    const ip = req.ip;
    if (Date.now() > this.resetTime) {
      this.requestCounts.clear();
      this.resetTime = Date.now() + this.windowMs;
    }
    const currentCount = this.requestCounts.get(ip) || 0;
    if (currentCount >= this.maxRequests) {
      return res.status(429).json({
        error: 'Too many requests, please try again later.',
        retryAfter: Math.ceil((this.resetTime - Date.now()) / 1000),
      });
    }
    this.requestCounts.set(ip, currentCount + 1);
    next();
  },
};

// Reset request counts every minute
setInterval(() => {
  rateLimiter.requestCounts.clear();
  rateLimiter.resetTime = Date.now() + rateLimiter.windowMs;
}, rateLimiter.windowMs);

// ----------------------------
// Helper: Call OpenAI API for AI-generated predictions
// ----------------------------
const generateAIResponse = async (prompt) => {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) throw new Error('OpenAI API key not configured');

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Use the appropriate OpenAI model
        messages: [
          {
            role: 'system',
            content: 'You are an expert predictor that outputs valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 0.95,
        frequency_penalty: 1.1,
      }),
    });

    const result = await response.json();

    if (result.error) {
      console.error('OpenAI API error:', result.error);
      throw new Error(result.error);
    }

    // Extract the generated text
    const generatedText = result.choices[0]?.message?.content;
    if (!generatedText) {
      throw new Error('No generated text found in response');
    }

    // Attempt to parse the generated text as JSON
    try {
      const jsonResponse = JSON.parse(generatedText);
      return jsonResponse;
    } catch (error) {
      console.error('Failed to parse AI response as JSON:', error);
      throw new Error('AI response is not valid JSON');
    }
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
};

// ----------------------------
// AI Prediction Data Generation
// ----------------------------
const formatTimeframe = (timeframe) => {
  switch (timeframe) {
    case '1week':
      return 'one week';
    case '1month':
      return 'one month';
    case '3months':
      return 'three months';
    case '6months':
      return 'six months';
    case '1year':
      return 'one year';
    case '5years':
      return 'five years';
    default:
      return 'the coming period';
  }
};

const generatePredictionData = async (request) => {
  const { topic, category, timeframe, context } = request;
  const prompt = `Create a prediction analysis for "${topic}" in the ${category} domain over ${formatTimeframe(timeframe)}.
Return a JSON object with exactly this structure:
{
  "prediction": "A detailed single-paragraph prediction",
  "dataPoints": "point1, point2, point3, point4, point5",
  "variables": "factor1, factor2, factor3, factor4, factor5",
  "historicalPatterns": "pattern1, pattern2, pattern3",
  "alternativeScenarios": "scenario1, scenario2, scenario3"
}
Make sure to return ONLY valid JSON, no additional text.`;

  try {
    const aiData = await generateAIResponse(prompt);
    console.log('AI prediction data:', aiData);
    const confidence = Math.floor(Math.random() * 46) + 50;
    const trendOptions = ['up', 'down', 'neutral'];
    const trend = trendOptions[Math.floor(Math.random() * trendOptions.length)];
    const now = new Date();
    const lastUpdated = now.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });

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
      lastUpdated,
    };
  } catch (err) {
    console.error('Error generating AI prediction data:', err);
    throw err;
  }
};

// ----------------------------
// Endpoints
// ----------------------------

// Sentiment Analysis Endpoint
app.post('/api/analyze', rateLimiter.check.bind(rateLimiter), async (req, res) => {
  try {
    const { company } = req.body;
    if (!company) {
      return res.status(400).json({ error: 'Company name is required' });
    }

    const news = await getCompanyNews(company);
    let totalScore = 0;
    news.forEach((headline) => {
      const tokens = tokenizer.tokenize(headline);
      const sentimentScore = analyzer.getSentiment(tokens);
      totalScore += sentimentScore;
    });
    const averageSentiment = totalScore / news.length;
    let sentimentLabel = 'neutral';
    if (averageSentiment > 0.2) {
      sentimentLabel = 'positive';
    } else if (averageSentiment < -0.2) {
      sentimentLabel = 'negative';
    }

    const ticker = company.slice(0, 4).toUpperCase();
    const financialData = await getFinancialData(ticker);

    const prediction = await generateAIResponse(`Based on a sentiment score of ${averageSentiment} (${sentimentLabel}), provide a concise prediction statement for ${company}.`);

    const now = new Date();
    const lastUpdated = now.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });

    res.json({
      company,
      ticker,
      sentiment: {
        score: averageSentiment,
        label: sentimentLabel,
      },
      ...financialData,
      prediction,
      lastUpdated,
    });
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    res.status(500).json({ error: 'Failed to analyze sentiment' });
  }
});

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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`- Frontend: http://localhost:${PORT}`);
  console.log(`- API: http://localhost:${PORT}/api`);
});