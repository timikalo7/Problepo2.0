import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

interface VoiceInputProps {
  onTranscriptChange: (transcript: string) => void;
  isListening: boolean;
  setIsListening: (isListening: boolean) => void;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ 
  onTranscriptChange, 
  isListening, 
  setIsListening 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable
  } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      onTranscriptChange(transcript);
    }
  }, [transcript, onTranscriptChange]);

  useEffect(() => {
    // Start listening when isListening becomes true
    if (isListening && !listening) {
      handleStartListening();
    } else if (!isListening && listening) {
      handleStopListening();
    }
  }, [isListening, listening]);

  const handleStartListening = async () => {
    try {
      setErrorMessage('');
      resetTranscript();
      await SpeechRecognition.startListening({ continuous: true });
    } catch (error) {
      setErrorMessage('Failed to start voice recognition');
      setIsListening(false);
      console.error('Speech recognition error:', error);
    }
  };

  const handleStopListening = () => {
    SpeechRecognition.stopListening();
    setIsProcessing(true);
    
    // Simulate processing delay
    setTimeout(() => {
      setIsProcessing(false);
    }, 1000);
  };

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="text-red-400 flex items-center justify-center p-3 bg-red-900/20 rounded-lg">
        <MicOff className="h-5 w-5 mr-2" />
        Your browser doesn't support speech recognition.
      </div>
    );
  }

  if (!isMicrophoneAvailable) {
    return (
      <div className="text-yellow-400 flex items-center justify-center p-3 bg-yellow-900/20 rounded-lg">
        <MicOff className="h-5 w-5 mr-2" />
        Microphone access is required for voice input.
      </div>
    );
  }

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium text-white">Voice Input</h3>
        <div className="flex items-center space-x-2">
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center text-indigo-300"
            >
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              <span className="text-sm">Processing...</span>
            </motion.div>
          )}
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsListening(!isListening)}
            className={`rounded-full p-3 flex items-center justify-center ${
              isListening 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
            disabled={isProcessing}
          >
            {isListening ? (
              <MicOff className="h-5 w-5 text-white" />
            ) : (
              <Mic className="h-5 w-5 text-white" />
            )}
          </motion.button>
        </div>
      </div>
      
      {/* Voice status indicator */}
      {isListening && (
        <div className="flex items-center mb-3">
          <div className="flex items-center space-x-1 mr-2">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 h-4 bg-indigo-500 rounded-full"
                animate={{
                  height: [4, 12, 8, 16, 4][i % 5],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>
          <span className="text-indigo-300 text-sm">Listening...</span>
        </div>
      )}
      
      {errorMessage && (
        <div className="text-red-400 text-sm mb-2">{errorMessage}</div>
      )}
      
      <div className="relative">
        <textarea
          value={transcript}
          onChange={(e) => onTranscriptChange(e.target.value)}
          placeholder="Speak or type your prediction request here..."
          className="w-full h-24 bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        
        {transcript && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetTranscript}
            className="absolute bottom-2 right-2 p-2 bg-gray-700 rounded-full hover:bg-gray-600"
            title="Clear text"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default VoiceInput;