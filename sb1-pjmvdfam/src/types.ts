export interface PredictionRequest {
  topic: string;
  category: string;
  timeframe: string;
  context: string;
}

export interface SavedPrompt extends PredictionRequest {
  savedAt: string;
}

export interface PredictionResult {
  topic: string;
  category: string;
  timeframe: string;
  prediction: string;
  confidence: number;
  trend: 'up' | 'down' | 'neutral';
  dataPoints: string[];
  variables: string[];
  historicalPatterns: string[];
  alternativeScenarios: string[];
  lastUpdated: string;
}

export interface ApiStatus {
  name: string;
  status: 'connected' | 'error' | 'disabled' | 'unknown';
  message?: string;
}

export interface PipelineStep {
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress?: number;
}

export interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
}

export interface NlpAnalysisResult {
  entities: {
    name: string;
    type: string;
    confidence: number;
  }[];
  sentiment: {
    score: number;
    label: 'positive' | 'negative' | 'neutral';
  };
  categories: string[];
  keywords: string[];
}