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

// ========================
// Financial Data via Alpha Vantage API
// ========================
const getFinancialData = async (ticker) => {
  try {
    // Call Global Quote endpoint
    const globalQuoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${process.env.ALPHAVANTAGE_API_KEY}`;
    const globalResponse = await fetch(globalQuoteUrl);
    const globalData = await globalResponse.json();
    const quote = globalData["Global Quote"];
    if (!quote) {
      throw new Error("Financial data not available");
    }
    const priceCurrent = parseFloat(quote["05. price"]);
    const priceChange = parseFloat(quote["09. change"]);
    const priceChangePercentStr = quote["10. change percent"]; // e.g. "0.7177%"
    const priceChangePercent = parseFloat(priceChangePercentStr);
    const volume = parseInt(quote["06. volume"]);
    
    // Call Company Overview endpoint for market cap
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

// ========================
// Company News via News API
// ========================
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

// ========================
// Prediction Generation (internal logic remains)
// ========================
const generatePredictionData = (request) => {
  const { topic, category, timeframe, context } = request;
  const confidence = Math.floor(Math.random() * 46) + 50;
  const trendOptions = ['up', 'down', 'neutral'];
  const trend = trendOptions[Math.floor(Math.random() * trendOptions.length)];
  
  let prediction = '';
  let dataPoints = [];
  let variables = [];
  let historicalPatterns = [];
  let alternativeScenarios = [];
  
  switch (category) {
    case 'finance':
      prediction = generateFinancePrediction(topic, timeframe, trend);
      dataPoints = generateFinanceDataPoints(topic);
      variables = [
        "Central bank interest rate decisions",
        "Quarterly earnings reports",
        "Geopolitical tensions affecting markets",
        "Regulatory changes in the industry",
        "Unexpected market volatility"
      ];
      historicalPatterns = [
        "Similar assets have shown cyclical patterns over 5-year periods",
        "Previous market corrections of this magnitude typically recover within 18 months",
        "Sector rotation typically follows this pattern during economic transitions"
      ];
      alternativeScenarios = [
        "Rapid growth scenario: Exceeding market expectations by 15-20%",
        "Moderate decline scenario: Temporary setback followed by recovery",
        "Stagnation scenario: Extended period of minimal movement"
      ];
      break;
      
    case 'sports':
      prediction = generateSportsPrediction(topic, timeframe);
      dataPoints = [
        "Historical performance in similar competitions",
        "Current team/athlete form and recent results",
        "Head-to-head statistics against likely opponents",
        "Injury reports and team composition changes",
        "Venue and environmental factors"
      ];
      variables = [
        "Unexpected injuries to key players",
        "Weather conditions affecting performance",
        "Coaching or strategic changes",
        "Psychological factors and team morale",
        "Referee decisions in critical moments"
      ];
      historicalPatterns = [
        "Teams with similar statistics have achieved comparable results in past tournaments",
        "Historical performance patterns in this competition suggest cyclical success rates",
        "Previous champions have shown similar performance metrics at this stage"
      ];
      alternativeScenarios = [
        "Underdog victory scenario: Unexpected breakthrough performance",
        "Favorite dominance scenario: Clear victory with significant margin",
        "Competitive balance scenario: Close contest with unpredictable outcome"
      ];
      break;
      
    case 'entertainment':
      prediction = generateEntertainmentPrediction(topic, timeframe);
      dataPoints = [
        "Current trends in audience preferences",
        "Historical performance of similar content/artists",
        "Industry expert opinions and early reviews",
        "Social media sentiment and engagement metrics",
        "Market positioning and promotional strategy"
      ];
      variables = [
        "Competing releases in the same timeframe",
        "Critical reception and word-of-mouth",
        "Unexpected controversies or publicity",
        "Platform algorithm changes affecting visibility",
        "Cultural events impacting public interest"
      ];
      historicalPatterns = [
        "Similar content has followed predictable audience growth patterns",
        "Seasonal trends show consistent preferences during this period",
        "Previous works by the same creators show recognizable reception patterns"
      ];
      alternativeScenarios = [
        "Breakout success scenario: Exceeding expectations with viral popularity",
        "Niche appeal scenario: Strong dedicated following but limited mainstream impact",
        "Delayed recognition scenario: Slow start followed by growing appreciation"
      ];
      break;
      
    case 'global':
      prediction = generateGlobalPrediction(topic, timeframe);
      dataPoints = [
        "Historical precedents in similar situations",
        "Current diplomatic relations between key actors",
        "Economic indicators and trade relationships",
        "Public opinion polling and sentiment analysis",
        "Expert analysis from political scientists and regional specialists"
      ];
      variables = [
        "Unexpected leadership changes or elections",
        "Natural disasters or humanitarian crises",
        "Technological disruptions affecting governance",
        "Shifts in international alliances",
        "Economic shocks or financial crises"
      ];
      historicalPatterns = [
        "Similar geopolitical tensions have resolved through diplomatic channels historically",
        "Regional power dynamics have followed predictable patterns in comparable situations",
        "Economic interdependence has influenced political outcomes in similar cases"
      ];
      alternativeScenarios = [
        "Cooperation scenario: Increased international collaboration and resolution",
        "Escalation scenario: Heightened tensions with potential for conflict",
        "Status quo scenario: Continued uncertainty with minimal substantive change"
      ];
      break;
      
    case 'environment':
      prediction = generateEnvironmentPrediction(topic, timeframe);
      dataPoints = [
        "Current measurement trends and scientific observations",
        "Climate modeling projections from multiple sources",
        "Historical data patterns and seasonal variations",
        "Policy implementation timelines and effectiveness metrics",
        "Technological adoption rates for relevant solutions"
      ];
      variables = [
        "Policy changes affecting environmental regulations",
        "Technological breakthroughs in relevant fields",
        "Natural events affecting measurement accuracy",
        "Changes in industrial activity or emissions",
        "Public behavior and consumption pattern shifts"
      ];
      historicalPatterns = [
        "Similar environmental interventions have shown measurable impacts within comparable timeframes",
        "Seasonal and cyclical patterns suggest predictable variations in measurements",
        "Previous policy implementations have demonstrated similar adoption and compliance rates"
      ];
      alternativeScenarios = [
        "Accelerated improvement scenario: Faster than expected positive change",
        "Delayed impact scenario: Slower response with eventual improvement",
        "Mixed outcome scenario: Improvements in some metrics offset by challenges in others"
      ];
      break;
      
    case 'technology':
      prediction = generateTechnologyPrediction(topic, timeframe);
      dataPoints = [
        "Current development roadmaps and industry announcements",
        "Investment patterns in relevant sectors",
        "Patent filings and research publication trends",
        "Early adoption metrics and user feedback",
        "Regulatory environment and compliance requirements"
      ];
      variables = [
        "Competitive technology developments",
        "Regulatory changes affecting implementation",
        "Supply chain disruptions or component availability",
        "Consumer adoption rates and market acceptance",
        "Unforeseen technical challenges or limitations"
      ];
      historicalPatterns = [
        "Similar technologies have followed predictable adoption curves",
        "Previous iterations have demonstrated consistent improvement metrics",
        "Market penetration for comparable innovations shows recognizable patterns"
      ];
      alternativeScenarios = [
        "Rapid adoption scenario: Faster than expected market penetration",
        "Niche application scenario: Limited but valuable specialized use cases",
        "Disruptive impact scenario: Unexpected applications transforming adjacent industries"
      ];
      break;
      
    default:
      prediction = "Based on available data, we predict moderate changes with potential for significant developments depending on several key factors.";
      dataPoints = [
        "Current trends suggest continued interest in this area",
        "Historical patterns indicate cyclical behavior",
        "Expert opinions are divided but cautiously optimistic",
        "Related indicators show correlated movement",
        "Preliminary data suggests emerging patterns"
      ];
      variables = [
        "Unexpected developments in related areas",
        "Changes in public interest or engagement",
        "Resource allocation and priority shifts",
        "External events affecting focus or implementation",
        "New information changing fundamental assumptions"
      ];
      historicalPatterns = [
        "Similar situations have resolved with mixed outcomes",
        "Previous instances show gradual progression rather than sudden changes",
        "Cyclical patterns suggest predictable variations over time"
      ];
      alternativeScenarios = [
        "Positive outcome scenario: Better than expected results",
        "Negative outcome scenario: Challenges exceeding anticipated difficulties",
        "Mixed outcome scenario: Varied results across different aspects"
      ];
  }
  
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
    prediction,
    confidence,
    trend,
    dataPoints,
    variables,
    historicalPatterns,
    alternativeScenarios,
    lastUpdated
  };
};

// Finance-specific predictions
const generateFinancePrediction = (topic, timeframe, trend) => {
  const upPredictions = [
    `${topic} is projected to experience growth over the ${formatTimeframe(timeframe)}. Market indicators suggest positive momentum with potential for increased valuation.`,
    `Analysis indicates an upward trajectory for ${topic} in the coming ${formatTimeframe(timeframe)}. Fundamental factors and technical indicators align for potential appreciation.`,
    `${topic} shows promising growth potential over the next ${formatTimeframe(timeframe)}. Market conditions and sector performance suggest favorable positioning.`
  ];
  
  const downPredictions = [
    `${topic} may face challenges in the ${formatTimeframe(timeframe)} ahead. Market indicators suggest potential correction or valuation adjustment.`,
    `Analysis indicates a potential downward adjustment for ${topic} over the next ${formatTimeframe(timeframe)}. Investors should consider defensive positioning.`,
    `${topic} shows signs of potential decline in the coming ${formatTimeframe(timeframe)}. Market conditions and competitive pressures may impact performance.`
  ];
  
  const neutralPredictions = [
    `${topic} is likely to maintain relatively stable performance over the ${formatTimeframe(timeframe)}. Significant volatility appears limited based on current indicators.`,
    `Analysis suggests ${topic} will trade within a defined range for the next ${formatTimeframe(timeframe)}. No strong directional bias is indicated by current metrics.`,
    `${topic} is projected to experience balanced forces over the coming ${formatTimeframe(timeframe)}, resulting in relatively neutral performance.`
  ];
  
  if (trend === 'up') {
    return upPredictions[Math.floor(Math.random() * upPredictions.length)];
  } else if (trend === 'down') {
    return downPredictions[Math.floor(Math.random() * downPredictions.length)];
  } else {
    return neutralPredictions[Math.floor(Math.random() * neutralPredictions.length)];
  }
};

const generateFinanceDataPoints = (topic) => {
  return [
    `${topic} has shown a correlation with broader market indices of 0.76`,
    `Technical indicators suggest a potential support level at recent lows`,
    `Institutional ownership has changed by 4.3% in the last quarter`,
    `Volatility metrics indicate lower than average expected movement`,
    `Sector performance shows similar assets moving in the same direction`
  ];
};

// Sports predictions
const generateSportsPrediction = (topic, timeframe) => {
  const predictions = [
    `${topic} shows strong potential for success in the upcoming ${formatTimeframe(timeframe)}. Performance metrics and competitive analysis suggest favorable outcomes.`,
    `Based on current form and historical performance, ${topic} is projected to achieve above-average results in the ${formatTimeframe(timeframe)} ahead.`,
    `Analysis of ${topic}'s recent performance indicates potential for significant achievement within the next ${formatTimeframe(timeframe)}, though competition remains strong.`,
    `${topic} faces mixed prospects in the coming ${formatTimeframe(timeframe)}. While strengths are evident in certain areas, challenges may limit overall success.`
  ];
  
  return predictions[Math.floor(Math.random() * predictions.length)];
};

// Entertainment predictions
const generateEntertainmentPrediction = (topic, timeframe) => {
  const predictions = [
    `${topic} is projected to generate significant audience interest over the next ${formatTimeframe(timeframe)}. Engagement metrics and early indicators suggest strong reception.`,
    `Analysis indicates ${topic} will likely achieve above-average popularity within the ${formatTimeframe(timeframe)}, potentially establishing a strong position in its category.`,
    `${topic} shows promising potential for cultural impact in the coming ${formatTimeframe(timeframe)}. Current trends and audience sentiment suggest favorable reception.`,
    `Based on comparable releases and market positioning, ${topic} may experience moderate success over the next ${formatTimeframe(timeframe)} with potential for growth.`
  ];
  
  return predictions[Math.floor(Math.random() * predictions.length)];
};

// Global event predictions
const generateGlobalPrediction = (topic, timeframe) => {
  const predictions = [
    `${topic} is likely to evolve significantly over the next ${formatTimeframe(timeframe)}. Current diplomatic efforts and stakeholder positions suggest movement toward resolution.`,
    `Analysis indicates ${topic} will remain a focal point for the coming ${formatTimeframe(timeframe)}, with gradual developments rather than dramatic shifts.`,
    `${topic} shows signs of potential breakthrough within the ${formatTimeframe(timeframe)}. Key indicators suggest conditions may be favorable for progress.`,
    `Based on historical precedents and current dynamics, ${topic} may experience complex developments over the next ${formatTimeframe(timeframe)} with multiple competing influences.`
  ];
  
  return predictions[Math.floor(Math.random() * predictions.length)];
};

// Environment predictions
const generateEnvironmentPrediction = (topic, timeframe) => {
  const predictions = [
    `${topic} is projected to show measurable changes over the next ${formatTimeframe(timeframe)}. Scientific models suggest continued trends with potential acceleration.`,
    `Analysis indicates ${topic} will likely experience significant developments within the ${formatTimeframe(timeframe)}, with implications for related environmental systems.`,
    `${topic} shows signs of potential stabilization in the coming ${formatTimeframe(timeframe)}, though regional variations may present a more complex picture.`,
    `Based on current measurements and intervention efforts, ${topic} may see gradual improvement over the next ${formatTimeframe(timeframe)}, contingent on continued action.`
  ];
  
  return predictions[Math.floor(Math.random() * predictions.length)];
};

// Technology predictions
const generateTechnologyPrediction = (topic, timeframe) => {
  const predictions = [
    `${topic} is poised for significant advancement in the next ${formatTimeframe(timeframe)}. Development roadmaps and research progress suggest breakthrough potential.`,
    `Analysis indicates ${topic} will likely achieve important milestones within the ${formatTimeframe(timeframe)}, potentially transforming related technological domains.`,
    `${topic} shows promising development trajectory for the coming ${formatTimeframe(timeframe)}. Current progress and investment patterns suggest accelerating innovation.`,
    `Based on current research and implementation efforts, ${topic} may reach commercial viability within the next ${formatTimeframe(timeframe)}, though challenges remain.`
  ];
  
  return predictions[Math.floor(Math.random() * predictions.length)];
};

// Helper: Format timeframe for output
const formatTimeframe = (timeframe) => {
  switch (timeframe) {
    case '1week': return 'week';
    case '1month': return 'month';
    case '3months': return 'three months';
    case '6months': return 'six months';
    case '1year': return 'year';
    case '5years': return 'five years';
    default: return 'coming period';
  }
};

// ========================
// Sentiment Analysis Endpoint
// ========================
app.post('/api/analyze', rateLimiter.check.bind(rateLimiter), async (req, res) => {
  try {
    const { company } = req.body;
    if (!company) {
      return res.status(400).json({ error: 'Company name is required' });
    }
    
    // Fetch company news via News API
    const news = await getCompanyNews(company);
    
    // Analyze sentiment of the headlines
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
    
    // For demo purposes, derive ticker from company name
    const ticker = company.slice(0, 4).toUpperCase();
    
    // Fetch financial data via Alpha Vantage API
    const financialData = await getFinancialData(ticker);
    
    // Generate a mystical prediction based on sentiment
    const prediction = generatePrediction({ score: averageSentiment, label: sentimentLabel });
    
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

// Generate prediction based on sentiment (internal logic)
const generatePrediction = (sentiment) => {
  const predictions = {
    positive: [
      "The stars align for growth and prosperity. Investors may find favorable returns in the coming quarter.",
      "A bright financial future awaits. The market energies suggest upward momentum.",
      "The mystical forces indicate a period of strength and resilience for this company.",
      "The crystal ball reveals a path of innovation and market leadership ahead.",
      "Cosmic alignments suggest this may be an opportune time for long-term investment."
    ],
    neutral: [
      "The mists of time show stability amid changing tides. Caution and patience are advised.",
      "The crystal ball's vision is clouded. Market forces appear balanced between positive and negative.",
      "The financial spirits whisper of steady waters ahead, neither stormy nor exceptionally calm.",
      "The mystical signs point to a period of consolidation before the next major move.",
      "The cosmic balance suggests holding your position while the market finds its direction."
    ],
    negative: [
      "Dark clouds gather on the financial horizon. Caution is strongly advised in the near term.",
      "The crystal ball warns of challenging times ahead. Protective measures may be wise.",
      "The mystical energies suggest a period of correction and reassessment is coming.",
      "The financial spirits appear troubled. Consider diversifying to weather potential storms.",
      "The cosmic signs point to a period of testing before eventual recovery."
    ]
  };
  
  const category = sentiment.score > 0.2 ? 'positive' : (sentiment.score < -0.2 ? 'negative' : 'neutral');
  return predictions[category][Math.floor(Math.random() * predictions[category].length)];
};

// ========================
// General Prediction Endpoint
// ========================
app.post('/api/predict', rateLimiter.check.bind(rateLimiter), (req, res) => {
  try {
    const predictionRequest = req.body;
    if (!predictionRequest.topic) {
      return res.status(400).json({ error: 'Prediction topic is required' });
    }
    const predictionData = generatePredictionData(predictionRequest);
    res.json(predictionData);
  } catch (error) {
    console.error('Error generating prediction:', error);
    res.status(500).json({ error: 'Failed to generate prediction' });
  }
});

// ========================
// Text-to-Speech via Voice RSS API
// ========================
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
    // Return the URL for the generated MP3 audio
    res.json({
      audioUrl: ttsUrl,
      format: 'mp3'
    });
  } catch (error) {
    console.error('Error generating speech:', error);
    res.status(500).json({ error: 'Failed to generate speech' });
  }
});

// ========================
// API Status Endpoint: Check real free API statuses
// ========================
app.get('/api/status', async (req, res) => {
  // Check Alpha Vantage
  let alphaVantageStatus = 'unknown';
  try {
    const globalQuoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=IBM&apikey=${process.env.PI_KEY}`;
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
