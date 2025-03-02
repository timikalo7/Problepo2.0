import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Trash } from 'lucide-react';

interface MysticalVoiceOracleProps {
  title?: string;
  subtitle?: string;
  className?: string;
  onTranscriptSelected?: (text: string) => void;
}

const MysticalVoiceOracle: React.FC<MysticalVoiceOracleProps> = ({
  title = "Mystical Voice Oracle",
  subtitle = "Speak your desires to the crystal ball",
  className = "",
  onTranscriptSelected,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const isInitializedRef = useRef<boolean>(false);

  useEffect(() => {
    // Check if browser supports Speech Recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition is not supported in your browser. Try Chrome or Edge.');
      return;
    }

    // Initialize speech recognition only once
    if (!isInitializedRef.current) {
      try {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        
        const recognition = recognitionRef.current;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          setTranscript((prev) => finalTranscript || interimTranscript || prev);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          if (event.error === 'not-allowed') {
            setError('Microphone access denied. Please allow microphone access in your browser settings.');
          } else if (event.error === 'aborted') {
            // This is a normal part of stopping recognition, don't show an error
            console.log('Speech recognition was aborted - this is normal when stopping');
          } else {
            setError(`Error: ${event.error}. Please try again.`);
          }
          setIsListening(false);
        };

        recognition.onend = () => {
          // Only restart if we're still in listening mode and it wasn't manually stopped
          if (isListening) {
            try {
              // Add a small delay before restarting to prevent rapid cycles
              setTimeout(() => {
                if (isListening && recognitionRef.current) {
                  recognitionRef.current.start();
                }
              }, 300);
            } catch (e) {
              console.error('Failed to restart recognition', e);
              setIsListening(false);
            }
          }
        };
        
        isInitializedRef.current = true;
      } catch (e) {
        console.error('Error initializing speech recognition', e);
        setError('Failed to initialize speech recognition. Please refresh the page and try again.');
      }
    }

    return () => {
      if (recognitionRef.current && isListening) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error('Error stopping recognition on cleanup', e);
        }
      }
    };
  }, [isListening]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    
    try {
      if (isListening) {
        // Stop listening
        recognitionRef.current.stop();
        if (transcript.trim() && onTranscriptSelected) {
          onTranscriptSelected(transcript);
        }
        setIsListening(false);
      } else {
        // Start listening with a small delay to ensure proper initialization
        setError(null);
        setIsListening(true);
        setTimeout(() => {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.error('Error starting speech recognition', e);
            setError('Failed to start speech recognition. Please try again.');
            setIsListening(false);
          }
        }, 100);
      }
    } catch (e) {
      console.error('Error toggling speech recognition', e);
      setError('Failed to control speech recognition. Please refresh the page and try again.');
      setIsListening(false);
    }
  };

  const clearTranscript = () => {
    setTranscript('');
  };

  const submitTranscript = () => {
    if (transcript.trim() && onTranscriptSelected) {
      onTranscriptSelected(transcript);
    }
  };

  // Add these styles to your global CSS or use a CSS-in-JS solution
  const customStyles = `
    .crystal-ball-custom-scrollbar::-webkit-scrollbar {
      width: 8px;
    }
    
    .crystal-ball-custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(76, 29, 149, 0.1);
      border-radius: 4px;
    }
    
    .crystal-ball-custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(124, 58, 237, 0.3);
      border-radius: 4px;
    }
    
    .crystal-ball-custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(124, 58, 237, 0.5);
    }
  `;

  return (
    <div className={`text-white font-serif ${className}`}>
      <style>{customStyles}</style>
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-purple-300 mb-3">{title}</h1>
          <p className="text-purple-200 italic">{subtitle}</p>
        </header>

        <main className="relative">
          {/* Crystal Ball */}
          <div className="flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0.8 }}
              animate={{ 
                scale: isListening ? [1, 1.05, 1] : 1,
                opacity: 1,
              }}
              transition={{ 
                duration: 2,
                repeat: isListening ? Infinity : 0,
                repeatType: "reverse"
              }}
              className="relative mb-8"
            >
              <button 
                onClick={toggleListening}
                className="w-48 h-48 md:w-64 md:h-64 rounded-full relative overflow-hidden focus:outline-none"
                aria-label={isListening ? "Stop recording" : "Start recording"}
              >
                {/* Crystal ball outer glow */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-600/30 to-blue-600/30 blur-xl"></div>
                
                {/* Crystal ball */}
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden backdrop-blur-sm border border-gray-700/50">
                  {/* Inner glow */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/10 to-blue-500/10"></div>
                  
                  {/* Reflections */}
                  <div className="absolute top-5 right-10 w-10 h-3 bg-white/20 rounded-full transform rotate-45"></div>
                  <div className="absolute top-10 left-12 w-6 h-2 bg-white/10 rounded-full transform -rotate-25"></div>
                  
                  {/* Mystical fog/clouds inside */}
                  <motion.div
                    animate={{
                      opacity: isListening ? [0.4, 0.7, 0.4] : 0.4,
                      scale: isListening ? [1, 1.1, 1] : 1,
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                    className="absolute inset-8 rounded-full bg-gradient-to-t from-purple-900/30 to-transparent"
                  ></motion.div>
                  
                  {/* Animated swirls when analyzing */}
                  {isListening && (
                    <>
                      <motion.div
                        animate={{
                          rotate: [0, 360],
                          opacity: [0.1, 0.3, 0.1],
                        }}
                        transition={{
                          duration: 8,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                        className="absolute inset-10 rounded-full border-4 border-purple-500/20 border-dashed"
                      ></motion.div>
                      <motion.div
                        animate={{
                          rotate: [360, 0],
                          opacity: [0.1, 0.4, 0.1],
                        }}
                        transition={{
                          duration: 12,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                        className="absolute inset-16 rounded-full border-4 border-blue-500/20 border-dashed"
                      ></motion.div>
                      
                      {/* Glowing center */}
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.4, 0.8, 0.4],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatType: "reverse"
                        }}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-r from-purple-500/40 to-blue-500/40 blur-md"
                      ></motion.div>
                    </>
                  )}
                  
                  {/* Text indicator */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-opacity-80 text-center text-sm px-4 z-10">
                    {isListening ? "Speaking..." : "Tap to speak"}
                  </div>
                </div>
              </button>
              
              {/* Base/stand */}
              <div className="w-32 h-8 bg-gradient-to-r from-gray-800 to-gray-700 rounded-full mx-auto -mt-4 relative z-0">
                <div className="w-40 h-3 bg-gradient-to-r from-gray-700 to-gray-600 rounded-full mx-auto absolute -bottom-2 left-1/2 transform -translate-x-1/2"></div>
              </div>
              
              {/* Status text */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center mt-4 text-purple-300"
              >
                <p className="text-lg font-medium">
                  {isListening 
                    ? "The crystal ball is listening to your words..." 
                    : "Click the crystal ball to speak your desires"}
                </p>
              </motion.div>
            </motion.div>
          </div>

          {/* Main content area */}
          <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl border border-purple-900/50 shadow-[0_0_15px_rgba(147,51,234,0.2)] overflow-hidden">
            <div className="p-6">
              {error && (
                <div className="bg-red-900/30 text-red-300 p-3 rounded-lg mb-4 border border-red-800/50">
                  {error}
                </div>
              )}

              {/* Current transcript */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold text-purple-300">Your Words</h2>
                  <button 
                    onClick={clearTranscript}
                    className="p-2 text-purple-400 hover:text-red-400 transition-colors"
                    title="Clear transcript"
                  >
                    <Trash size={18} />
                  </button>
                </div>
                <div className="min-h-24 p-4 rounded-lg border border-purple-800/50 bg-black/30 text-purple-100">
                  {transcript || (
                    <span className="text-purple-400/60 italic">
                      The crystal ball awaits your voice...
                    </span>
                  )}
                </div>
              </div>

              {/* Submit button */}
              {transcript && (
                <div className="flex justify-center mt-4">
                  <button
                    onClick={submitTranscript}
                    className="px-6 py-2 bg-purple-700 hover:bg-purple-600 rounded-lg transition-colors text-white font-medium"
                  >
                    Use This Prophecy
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MysticalVoiceOracle;