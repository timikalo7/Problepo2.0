import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';

interface AudioResponseProps {
  text: string;
  isGenerating: boolean;
}

const AudioResponse: React.FC<AudioResponseProps> = ({ text, isGenerating }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayAudio = async () => {
    if (!text) {
      setError('No prediction text to convert to speech');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      // In a real implementation, this would call the backend to generate audio
      // For demo purposes, we're using the browser's built-in speech synthesis
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => {
        setIsPlaying(true);
        setIsLoading(false);
      };
      
      utterance.onend = () => {
        setIsPlaying(false);
      };
      
      utterance.onerror = () => {
        setIsPlaying(false);
        setIsLoading(false);
        setError('Failed to play audio');
      };
      
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      setIsLoading(false);
      setError('Failed to generate or play audio');
      console.error('Audio playback error:', err);
    }
  };

  const handleStopAudio = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium text-white">Audio Response</h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={isPlaying ? handleStopAudio : handlePlayAudio}
          disabled={isGenerating || isLoading || !text}
          className={`rounded-full p-3 flex items-center justify-center ${
            isPlaying 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-indigo-600 hover:bg-indigo-700'
          } ${(isGenerating || isLoading || !text) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 text-white animate-spin" />
          ) : isPlaying ? (
            <VolumeX className="h-5 w-5 text-white" />
          ) : (
            <Volume2 className="h-5 w-5 text-white" />
          )}
        </motion.button>
      </div>
      
      {error && (
        <div className="text-red-400 text-sm mb-2">{error}</div>
      )}
      
      {isPlaying && (
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
          <span className="text-indigo-300 text-sm">Playing audio response...</span>
        </div>
      )}
      
      <audio ref={audioRef} className="hidden" />
    </div>
  );
};

export default AudioResponse;