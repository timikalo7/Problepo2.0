import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2, AlertTriangle, Info, Mic, Settings } from 'lucide-react';
import PredictionOrb from './components/PredictionOrb';
import ResultsDisplay from './components/ResultsDisplay';
import PredictionForm from './components/PredictionForm';
import VoiceInput from './components/VoiceInput';
import AudioResponse from './components/AudioResponse';
import ApiStatusIndicator from './components/ApiStatusIndicator';
import ProcessingPipeline from './components/ProcessingPipeline';
import { getPrediction, getApiStatus } from './services/api';
import { PredictionRequest, PredictionResult, ApiStatus, PipelineStep } from './types';

function App() {
  const [predictionRequest, setPredictionRequest] = useState<PredictionRequest>({
    topic: '',
    category: 'finance',
    timeframe: '3months',
    context: ''
  });
  const [results, setResults] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showApiStatus, setShowApiStatus] = useState(false);
  const [apiStatuses, setApiStatuses] = useState<ApiStatus[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>([
    { name: 'Voice Recognition', status: 'pending' },
    { name: 'Natural Language Processing', status: 'pending' },
    { name: 'Data Collection', status: 'pending' },
    { name: 'Pattern Analysis', status: 'pending' },
    { name: 'Prediction Generation', status: 'pending' }
  ]);

  useEffect(() => {
    const fetchApiStatus = async () => {
      try {
        const statuses = await getApiStatus();
        setApiStatuses(statuses);
      } catch (err) {
        console.error('Failed to fetch API status:', err);
      }
    };

    fetchApiStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!predictionRequest.topic.trim()) {
      setError('Please enter a prediction topic');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    // Reset pipeline steps
    setPipelineSteps(steps => 
      steps.map(step => ({ ...step, status: 'pending', progress: undefined }))
    );

    try {
      // Simulate pipeline processing
      await simulatePipelineProcessing();
      
      const data = await getPrediction(predictionRequest);
      setResults(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate prediction. Please try again.';
      setError(errorMessage);
      console.error('Error in form submission:', errorMessage);
      
      // Mark the last step as error
      setPipelineSteps(steps => {
        const newSteps = [...steps];
        const lastActiveIndex = newSteps.findIndex(step => step.status === 'processing');
        if (lastActiveIndex >= 0) {
          newSteps[lastActiveIndex].status = 'error';
        }
        return newSteps;
      });
    } finally {
      setLoading(false);
    }
  };

  const simulatePipelineProcessing = async () => {
    const stepDurations = [2000, 3000, 2500, 3500, 2000];
    
    for (let i = 0; i < pipelineSteps.length; i++) {
      // Set current step to processing
      setPipelineSteps(steps => {
        const newSteps = [...steps];
        newSteps[i].status = 'processing';
        newSteps[i].progress = 0;
        return newSteps;
      });
      
      // Simulate progress updates
      const duration = stepDurations[i];
      const interval = duration / 10;
      
      for (let progress = 10; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, interval));
        
        setPipelineSteps(steps => {
          const newSteps = [...steps];
          newSteps[i].progress = progress;
          return newSteps;
        });
      }
      
      // Mark step as completed
      setPipelineSteps(steps => {
        const newSteps = [...steps];
        newSteps[i].status = 'completed';
        return newSteps;
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPredictionRequest(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTranscriptChange = (transcript: string) => {
    setPredictionRequest(prev => ({
      ...prev,
      topic: transcript
    }));
  };

  const handleOrbClick = () => {
    if (!loading && !isListening) {
      setIsListening(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-500 flex items-center justify-center">
            <span>Pr</span>
            <span>o</span>
            <span>blep</span>
            <img 
              src="https://i.imgur.com/Oa3kNRH.png" 
              alt="o" 
              className="w-12 h-12 md:w-16 md:h-16 inline-block mx-[-2px] transform translate-y-[2px]" 
            />
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Data-driven predictions for finance, sports, entertainment, global events, and more
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="relative flex items-center mb-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={predictionRequest.topic}
                onChange={(e) => setPredictionRequest(prev => ({ ...prev, topic: e.target.value }))}
                placeholder="What would you like a prediction for? (e.g., Bitcoin price, World Cup winner)"
                className="block w-full pl-10 pr-40 py-4 rounded-full bg-gray-800 bg-opacity-50 border border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300"
              />
              <div className="absolute right-2 flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(255, 255, 255, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  type="button"
                  onClick={() => setIsListening(!isListening)}
                  className="rounded-full p-2 bg-indigo-700 text-white font-medium hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300"
                >
                  <Mic className="h-5 w-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(255, 255, 255, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  type="button"
                  onClick={() => setShowForm(!showForm)}
                  className="rounded-full p-2 bg-indigo-700 text-white font-medium hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300"
                >
                  <Info className="h-5 w-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(255, 255, 255, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  type="button"
                  onClick={() => setShowApiStatus(!showApiStatus)}
                  className="rounded-full p-2 bg-indigo-700 text-white font-medium hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300"
                >
                  <Settings className="h-5 w-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(255, 255, 255, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  type="submit"
                  disabled={loading}
                  className="rounded-full px-6 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-medium hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-300"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <span className="flex items-center">
                      Predict
                    </span>
                  )}
                </motion.button>
              </div>
            </div>
            
            {isListening && (
              <VoiceInput 
                onTranscriptChange={handleTranscriptChange}
                isListening={isListening}
                setIsListening={setIsListening}
              />
            )}
            
            {showForm && (
              <PredictionForm 
                predictionRequest={predictionRequest} 
                handleInputChange={handleInputChange} 
              />
            )}
            
            {showApiStatus && (
              <ApiStatusIndicator apiStatuses={apiStatuses} />
            )}
            
            <ProcessingPipeline 
              steps={pipelineSteps}
              isProcessing={loading}
            />
            
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 flex items-center justify-center mb-4"
              >
                <AlertTriangle className="h-5 w-5 mr-2" />
                {error}
              </motion.div>
            )}
          </form>

          <div className="flex flex-col items-center">
            <PredictionOrb 
              isAnalyzing={loading} 
              category={predictionRequest.category}
              onOrbClick={handleOrbClick}
            />

            {results && (
              <>
                <ResultsDisplay results={results} />
                <AudioResponse 
                  text={results.prediction}
                  isGenerating={loading}
                />
              </>
            )}
            
            {!loading && !results && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center mt-8 max-w-2xl"
              >
                <h2 className="text-2xl font-semibold mb-4">Welcome to Problepo</h2>
                <p className="text-gray-300 mb-4">
                  Enter any topic above or use voice input to receive data-driven predictions about:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div className="bg-indigo-900 bg-opacity-50 p-3 rounded-lg transition-all duration-300 hover:bg-opacity-70 hover:transform hover:scale-105">Financial Markets</div>
                  <div className="bg-indigo-900 bg-opacity-50 p-3 rounded-lg transition-all duration-300 hover:bg-opacity-70 hover:transform hover:scale-105">Sports Outcomes</div>
                  <div className="bg-indigo-900 bg-opacity-50 p-3 rounded-lg transition-all duration-300 hover:bg-opacity-70 hover:transform hover:scale-105">Entertainment Events</div>
                  <div className="bg-indigo-900 bg-opacity-50 p-3 rounded-lg transition-all duration-300 hover:bg-opacity-70 hover:transform hover:scale-105">Global Developments</div>
                  <div className="bg-indigo-900 bg-opacity-50 p-3 rounded-lg transition-all duration-300 hover:bg-opacity-70 hover:transform hover:scale-105">Environmental Changes</div>
                  <div className="bg-indigo-900 bg-opacity-50 p-3 rounded-lg transition-all duration-300 hover:bg-opacity-70 hover:transform hover:scale-105">Technology Trends</div>
                </div>
                <p className="text-gray-400 mt-6 text-sm italic">
                  Disclaimer: All predictions are speculative and should not be taken as guaranteed outcomes.
                  Predictions are based on available data and algorithmic analysis.
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;