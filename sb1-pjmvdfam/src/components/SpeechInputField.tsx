import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

interface SpeechInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const SpeechInputField: React.FC<SpeechInputFieldProps> = ({
  value,
  onChange,
  placeholder = "What would you like a prediction for?",
  className = ""
}) => {
  const [isListening, setIsListening] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const startTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable
  } = useSpeechRecognition({
    clearTranscriptOnListen: true
  });

  useEffect(() => {
    if (transcript) {
      onChange(transcript);
    }
  }, [transcript, onChange]);

  const handleStartListening = async () => {
    try {
      setErrorMessage('');
      setIsListening(true);
      resetTranscript();
      
      // Clear any existing timeout
      if (startTimeoutRef.current) {
        clearTimeout(startTimeoutRef.current);
      }
      
      // Use a timeout to prevent rapid start/stop cycles
      startTimeoutRef.current = setTimeout(async () => {
        try {
          await SpeechRecognition.startListening({ 
            continuous: true,
            language: 'en-US'
          });
        } catch (error) {
          console.error('Failed to start speech recognition:', error);
          setErrorMessage('Failed to start voice recognition. Please try again.');
          setIsListening(false);
        }
      }, 300);
    } catch (error) {
      console.error('Speech recognition setup error:', error);
      setErrorMessage('Failed to initialize voice recognition');
      setIsListening(false);
    }
  };

  const handleStopListening = () => {
    try {
      // Clear any pending start timeout
      if (startTimeoutRef.current) {
        clearTimeout(startTimeoutRef.current);
        startTimeoutRef.current = null;
      }
      
      SpeechRecognition.stopListening();
      setIsListening(false);
      setIsProcessing(true);
      
      // Simulate processing delay
      setTimeout(() => {
        setIsProcessing(false);
      }, 800);
    } catch (error) {
      console.error('Failed to stop speech recognition:', error);
    }
  };

  // Update isListening state based on the actual listening state
  useEffect(() => {
    setIsListening(listening);
  }, [listening]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (startTimeoutRef.current) {
        clearTimeout(startTimeoutRef.current);
      }
      
      if (isListening) {
        try {
          SpeechRecognition.stopListening();
        } catch (error) {
          console.error('Error stopping speech recognition on unmount:', error);
        }
      }
    };
  }, [isListening]);

  if (!browserSupportsSpeechRecognition || !isMicrophoneAvailable) {
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`block w-full pl-10 pr-10 py-4 rounded-full bg-gray-800 bg-opacity-50 border border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300 ${className}`}
      />
    );
  }

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`block w-full pl-10 pr-14 py-4 rounded-full bg-gray-800 bg-opacity-50 border border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300 ${className}`}
      />
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={isListening ? handleStopListening : handleStartListening}
        className={`absolute right-3 top-1/2 transform -translate-y-1/2 rounded-full p-2 ${
          isListening 
            ? 'bg-red-600 hover:bg-red-700' 
            : 'bg-indigo-700 hover:bg-indigo-600'
        } text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300`}
      >
        {isProcessing ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : isListening ? (
          <MicOff className="h-5 w-5" />
        ) : (
          <Mic className="h-5 w-5" />
        )}
      </motion.button>
      
      {isListening && (
        <div className="absolute -bottom-6 left-0 right-0 flex items-center justify-center">
          <div className="flex items-center space-x-1 mr-2">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 h-3 bg-indigo-500 rounded-full"
                animate={{
                  height: [3, 9, 6, 12, 3][i % 5],
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
          <span className="text-indigo-300 text-xs">Listening...</span>
        </div>
      )}
      
      {errorMessage && (
        <div className="absolute -bottom-6 left-0 right-0 text-center text-red-400 text-xs">{errorMessage}</div>
      )}
    </div>
  );
};

export default SpeechInputField;