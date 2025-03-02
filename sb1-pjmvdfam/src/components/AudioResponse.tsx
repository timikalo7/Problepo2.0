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

      // Call your backend text-to-speech API endpoint
      const response = await fetch('http://localhost:3001/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('TTS request failed');
      }

      const data = await response.json();
      
      if (audioRef.current) {
        audioRef.current.src = data.audioUrl;
        audioRef.current.onplaying = () => {
          setIsPlaying(true);
          setIsLoading(false);
        };
        audioRef.current.onended = () => {
          setIsPlaying(false);
        };
        audioRef.current.onerror = () => {
          setError('Failed to play audio');
          setIsPlaying(false);
          setIsLoading(false);
        };
        // Start playback
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('Audio playback error:', error);
            setError('Failed to play audio. Try clicking the button again.');
            setIsLoading(false);
          });
        }
      }
    } catch (err) {
      setIsLoading(false);
      setError('Failed to generate or play audio');
      console.error('Audio playback error:', err);
    }
  };

  const handleStopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
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