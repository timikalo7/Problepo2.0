import os
import random
import datetime
import requests
from flask import Flask, request, jsonify
import nltk

# Download VADER lexicon if not already available
nltk.download('vader_lexicon', quiet=True)
from nltk.sentiment.vader import SentimentIntensityAnalyzer

app = Flask(__name__)

# ----------------------------
# /api/predict Endpoint
# ----------------------------
@app.route('/api/predict', methods=['POST'])
def predict():
    data = request.get_json()
    topic = data.get('topic')
    category = data.get('category')
    timeframe = data.get('timeframe')
    prediction = data.get('prediction')
    dataPoints = data.get('dataPoints')
    variables = data.get('variables')
    historicalPatterns = data.get('historicalPatterns')
    alternativeScenarios = data.get('alternativeScenarios')

    if not topic or not category or not timeframe:
        return jsonify({'error': 'Missing required fields (topic, category, timeframe)'}), 400

    # Generate prediction data
    confidence = random.randint(50, 95)
    trend = random.choice(['up', 'down', 'neutral'])
    
    lastUpdated = datetime.datetime.now().strftime("%b %d, %Y, %I:%M %p")
    
    result = {
        "topic": topic,
        "category": category,
        "timeframe": timeframe,
        "prediction": prediction,
        "confidence": confidence,
        "trend": trend,
        "dataPoints": dataPoints,
        "variables": variables,
        "historicalPatterns": historicalPatterns,
        "alternativeScenarios": alternativeScenarios,
        "lastUpdated": lastUpdated
    }
    
    return jsonify(result)

# ----------------------------
# /api/text-to-speech Endpoint
# ----------------------------
@app.route('/api/text-to-speech', methods=['POST'])
def text_to_speech():
    data = request.get_json()
    text = data.get('text')
    if not text:
        return jsonify({'error': 'Text is required'}), 400
    api_key = os.environ.get('VOICERSS_API_KEY')
    if not api_key:
        return jsonify({'error': 'TTS API key not configured'}), 500
    
    # Build the Voice RSS TTS URL
    audio_url = f"http://api.voicerss.org/?key={api_key}&hl=en-us&src={requests.utils.quote(text)}"
    
    # Return the URL and format as expected
    return jsonify({"audioUrl": audio_url, "format": "mp3"})

# ----------------------------
# /api/analyze Endpoint
# ----------------------------
@app.route('/api/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    company = data.get('company')
    if not company:
        return jsonify({'error': 'Company name is required'}), 400

    # Get news headlines using News API (if configured)
    news_api_key = os.environ.get('NEWS_API_KEY')
    headlines = []
    if news_api_key:
        news_url = "https://newsapi.org/v2/everything"
        params = {
            "q": company,
            "apiKey": news_api_key,
            "pageSize": 5
        }
        news_response = requests.get(news_url, params=params)
        if news_response.status_code == 200:
            articles = news_response.json().get('articles', [])
            headlines = [article['title'] for article in articles if article.get('title')]
    if not headlines:
        headlines = [f"{company} announces new developments", f"Latest update on {company}"]

    # Perform sentiment analysis using VADER
    sia = SentimentIntensityAnalyzer()
    total_score = 0
    for headline in headlines:
        sentiment = sia.polarity_scores(headline)
        total_score += sentiment['compound']
    average_sentiment = total_score / len(headlines)
    if average_sentiment > 0.2:
        sentiment_label = 'positive'
    elif average_sentiment < -0.2:
        sentiment_label = 'negative'
    else:
        sentiment_label = 'neutral'
    
    # Generate a ticker symbol (first 4 letters, uppercase)
    ticker = company[:4].upper()

    # Get financial data using Alpha Vantage (if configured)
    alpha_vantage_key = os.environ.get('ALPHAVANTAGE_API_KEY')
    financial_data = {}
    if alpha_vantage_key:
        av_url = "https://www.alphavantage.co/query"
        # Global Quote
        params_quote = {
            "function": "GLOBAL_QUOTE",
            "symbol": ticker,
            "apikey": alpha_vantage_key
        }
        av_response = requests.get(av_url, params=params_quote)
        if av_response.status_code == 200:
            av_json = av_response.json()
            quote = av_json.get("Global Quote", {})
            if quote:
                try:
                    price_current = float(quote.get("05. price", 0))
                    price_change = float(quote.get("09. change", 0))
                    change_percent_str = quote.get("10. change percent", "0%")
                    price_change_percent = float(change_percent_str.strip('%'))
                    volume = int(quote.get("06. volume", 0))
                except ValueError:
                    price_current = price_change = price_change_percent = volume = 0
                financial_data = {
                    "price": {
                        "current": price_current,
                        "change": price_change,
                        "changePercent": price_change_percent
                    },
                    "volume": volume,
                    "marketCap": "N/A"
                }
        # Company Overview for market cap
        params_overview = {
            "function": "OVERVIEW",
            "symbol": ticker,
            "apikey": alpha_vantage_key
        }
        overview_response = requests.get(av_url, params=params_overview)
        if overview_response.status_code == 200:
            overview_data = overview_response.json()
            market_cap = overview_data.get("MarketCapitalization")
            if market_cap:
                try:
                    market_cap_val = float(market_cap)
                    market_cap_formatted = f"${market_cap_val/1e9:.1f}B"
                except ValueError:
                    market_cap_formatted = "N/A"
                financial_data["marketCap"] = market_cap_formatted

    # Generate a mystical prediction based on sentiment
    predictions = {
        "positive": [
            f"The outlook for {company} is bright with significant growth expected.",
            f"{company} is poised for success with positive market momentum."
        ],
        "neutral": [
            f"{company} is expected to remain stable with moderate changes.",
            f"Balanced conditions suggest steady performance for {company}."
        ],
        "negative": [
            f"Challenges lie ahead for {company}, with a potential decline in performance.",
            f"{company} may face setbacks and downturns in the near future."
        ]
    }
    prediction = random.choice(predictions[sentiment_label])
    last_updated = datetime.datetime.now().strftime("%b %d, %Y, %I:%M %p")

    result = {
        "company": company,
        "ticker": ticker,
        "sentiment": {
            "score": average_sentiment,
            "label": sentiment_label
        },
        **financial_data,
        "prediction": prediction,
        "lastUpdated": last_updated
    }
    return jsonify(result)

# ----------------------------
# /api/status Endpoint
# ----------------------------
@app.route('/api/status', methods=['GET'])
def status():
    statuses = []
    
    # Prediction API (this backend)
    statuses.append({ "name": "Prediction API", "status": "connected" })
    
    # Voice RSS TTS check
    api_key = os.environ.get('VOICERSS_API_KEY')
    if not api_key:
        statuses.append({ "name": "Voice RSS TTS", "status": "disabled", "message": "API key not configured" })
    else:
        test_params = {
            "key": api_key,
            "hl": "en-us",
            "src": "test"
        }
        test_response = requests.get("http://api.voicerss.org/", params=test_params)
        if test_response.status_code == 200 and "ERROR" not in test_response.text:
            statuses.append({ "name": "Voice RSS TTS", "status": "connected" })
        else:
            statuses.append({ "name": "Voice RSS TTS", "status": "error", "message": "Test failed" })
    
    # Wit.ai Speech-to-Text check
    wit_token = os.environ.get('WIT_AI_TOKEN')
    if not wit_token:
        statuses.append({ "name": "Wit.ai Speech-to-Text", "status": "disabled", "message": "Token not configured" })
    else:
        statuses.append({ "name": "Wit.ai Speech-to-Text", "status": "connected" })
    
    return jsonify(statuses)

# ----------------------------
# Run the App
# ----------------------------
if __name__ == '__main__':
    # Run on port 3001 and listen on all interfaces
    app.run(host='0.0.0.0', port=3001, debug=True)
