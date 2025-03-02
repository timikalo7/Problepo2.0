import React from 'react';
import { motion } from 'framer-motion';

interface CrystalBallProps {
  isListening: boolean;
  onClick: () => void;
}

const CrystalBall: React.FC<CrystalBallProps> = ({ isListening, onClick }) => {
  return (
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
      className="relative mb-12"
    >
      <button 
        onClick={onClick}
        className="w-64 h-64 md:w-80 md:h-80 rounded-full relative overflow-hidden focus:outline-none"
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
        className="text-center mt-6 text-purple-300"
      >
        <p className="text-lg font-medium">
          {isListening 
            ? "The crystal ball is listening to your words..." 
            : "Click the crystal ball to speak your desires"}
        </p>
      </motion.div>
    </motion.div>
  );
};

export default CrystalBall;