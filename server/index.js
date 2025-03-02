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
// Helper: Call Hugging Face Inference API for AI-generated predictions
// ----------------------------
const generateAIResponse = async (prompt) => {
  const hfApiKey = "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";
  if (!hfApiKey) throw new Error("Hugging Face API key not configured");
  const response = await fetch("https://api-inference.huggingface.co/models/distilgpt2", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${hfApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ inputs: prompt })
  });
  const result = await response.json();
  // Expecting an array with generated text
  if (Array.isArray(result) && result.length > 0 && result[0].generated_text) {
    return result[0].generated_text;
  }
  throw new Error("AI generation failed");
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
 * Uses a free AI prediction API (via Hugging Face) to generate prediction details.
 * Expects the model to return valid JSON with the following keys:
 *   prediction, dataPoints (array), variables (array),
 *   historicalPatterns (array), alternativeScenarios (array)
 */
const generatePredictionData = async (request) => {
  const { topic, category, timeframe, context } = request;
  const prompt = `You are an expert predictor in the domain of ${category}.
Generate a JSON object with the following keys:
- "prediction": A detailed prediction statement for "${topic}" over the next ${formatTimeframe(timeframe)}.
- "dataPoints": An array of 5 bullet points supporting the prediction.
- "variables": An array of 5 key factors that may affect the outcome.
- "historicalPatterns": An array of 3 historical patterns relevant to this topic.
- "alternativeScenarios": An array of 3 alternative scenarios for the outcome.

Ensure the output is valid JSON.`;
  try {
    const aiText = await generateAIResponse(prompt);
    const aiData = JSON.parse(aiText);
    const confidence = Math.floor(Math.random() * 46) + 50; // Optionally, you can also generate this via AI.
    const trendOptions = ['up', 'down', 'neutral'];
    const trend = trendOptions[Math.floor(Math.random() * trendOptions.length)];
    const now = new Date();
    const lastUpdated = now.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
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
      lastUpdated
    };
  } catch (err) {
    console.error("Error generating AI prediction data:", err);
    throw err;
  }
};

/**
 * Generates a concise prediction statement based on sentiment using the AI API.
 */
const generatePrediction = async (sentiment) => {
  const prompt = `You are a financial market predictor. Based on a sentiment score of ${sentiment.score} (${sentiment.label}),
provide a concise prediction statement for a company.`;
  try {
    const aiText = await generateAIResponse(prompt);
    return aiText;
  } catch (err) {
    console.error("Error generating AI prediction:", err);
    return "Prediction unavailable.";
  }
};

// ----------------------------
// Financial Data via Alpha Vantage API
// ----------------------------
const getFinancialData = async (ticker) => {
  try {
    const globalQuoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${process.env.ALPHAVANTAGE_API_KEY}`;
    const globalResponse = await fetch(globalQuoteUrl);
    const globalData = await globalResponse.json();
    const quote = globalData["Global Quote"];
    if (!quote) {
      throw new Error("Financial data not available");
    }
    const priceCurrent = parseFloat(quote["05. price"]);
    const priceChange = parseFloat(quote["09. change"]);
    const priceChangePercentStr = quote["10. change percent"];
    const priceChangePercent = parseFloat(priceChangePercentStr);
    const volume = parseInt(quote["06. volume"]);
    
    const overviewUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${process.env.ALPHAVANTAGE_API_KEY}`;
    const overviewResponse = await fetch(overviewUrl);
    const overviewData = await overviewResponse.json();
    const marketCap = overviewData["MarketCapitalization"]
      ? `$${(parseFloat(overviewData["MarketCapitalization"]) / 1e9).toFixed(1)}B`
      : "N/A";
    
    return {
      price: {
        current: priceCurrent,
        change: priceChange,
        changePercent: priceChangePercent
      },
      volume,
      marketCap
    };
  } catch (error) {
    console.error("Error fetching financial data:", error);
    throw error;
  }
};

// ----------------------------
// Company News via News API
// ----------------------------
const getCompanyNews = async (company) => {
  try {
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(company)}&apiKey=${process.env.NEWS_API_KEY}&pageSize=5`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.articles && data.articles.length > 0) {
      return data.articles.map(article => article.title);
    } else {
      return [`No news found for ${company}.`];
    }
  } catch (error) {
    console.error("Error fetching company news:", error);
    return [`Error fetching news for ${company}.`];
  }
};

// ----------------------------
// Endpoints
// ----------------------------

// Sentiment Analysis Endpoint (used for company analysis)
app.post('/api/analyze', rateLimiter.check.bind(rateLimiter), async (req, res) => {
  try {
    const { company } = req.body;
    if (!company) {
      return res.status(400).json({ error: 'Company name is required' });
    }
    
    const news = await getCompanyNews(company);
    let totalScore = 0;
    news.forEach(headline => {
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
    
    const prediction = await generatePrediction({ score: averageSentiment, label: sentimentLabel });
    
    const now = new Date();
    const lastUpdated = now.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
    
    res.json({
      company,
      ticker,
      sentiment: {
        score: averageSentiment,
        label: sentimentLabel
      },
      ...financialData,
      prediction,
      lastUpdated
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

// Text-to-Speech via Voice RSS API
app.post('/api/text-to-speech', rateLimiter.check.bind(rateLimiter), async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    const apiKey = process.env.VOICERSS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'TTS API key not configured' });
    }
    const ttsUrl = `http://api.voicerss.org/?key=${apiKey}&hl=en-us&src=${encodeURIComponent(text)}`;
    res.json({
      audioUrl: ttsUrl,
      format: 'mp3'
    });
  } catch (error) {
    console.error('Error generating speech:', error);
    res.status(500).json({ error: 'Failed to generate speech' });
  }
});

// API Status Endpoint
app.get('/api/status', async (req, res) => {
  // Check Alpha Vantage
  let alphaVantageStatus = 'unknown';
  try {
    const globalQuoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=IBM&apikey=${process.env.ALPHAVANTAGE_API_KEY}`;
    const response = await fetch(globalQuoteUrl);
    const data = await response.json();
    if (data["Global Quote"]) {
      alphaVantageStatus = 'connected';
    } else {
      alphaVantageStatus = 'error';
    }
  } catch (error) {
    alphaVantageStatus = 'error';
  }

  // Check News API
  let newsApiStatus = 'unknown';
  try {
    const newsUrl = `https://newsapi.org/v2/top-headlines?country=us&pageSize=1&apiKey=${process.env.NEWS_API_KEY}`;
    const response = await fetch(newsUrl);
    const data = await response.json();
    if (data.articles) {
      newsApiStatus = 'connected';
    } else {
      newsApiStatus = 'error';
    }
  } catch (error) {
    newsApiStatus = 'error';
  }
  
  // Check Voice RSS API by making a test call
  let voiceRssStatus = 'unknown';
  try {
    const testText = "Test";
    const ttsUrl = `http://api.voicerss.org/?key=${process.env.VOICERSS_API_KEY}&hl=en-us&src=${encodeURIComponent(testText)}`;
    const response = await fetch(ttsUrl);
    const data = await response.text();
    if (data && !data.includes("ERROR")) {
      voiceRssStatus = 'connected';
    } else {
      voiceRssStatus = 'error';
    }
  } catch (error) {
    voiceRssStatus = 'error';
  }
  
  res.json([
    { name: 'Alpha Vantage', status: alphaVantageStatus },
    { name: 'News API', status: newsApiStatus },
    { name: 'Voice RSS TTS', status: voiceRssStatus }
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
