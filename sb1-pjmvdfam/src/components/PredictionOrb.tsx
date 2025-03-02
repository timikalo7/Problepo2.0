import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PredictionOrbProps {
  isAnalyzing: boolean;
  category: string;
  onOrbClick?: () => void;
}

const PredictionOrb: React.FC<PredictionOrbProps> = ({ isAnalyzing, category, onOrbClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Define color schemes for different prediction categories
  const getCategoryColors = (category: string) => {
    switch (category) {
      case 'finance':
        return {
          primary: 'from-indigo-600/30 to-blue-600/30',
          secondary: 'from-indigo-500/10 to-blue-500/10',
          accent1: 'border-indigo-500/20',
          accent2: 'border-blue-500/20',
          glow: 'from-indigo-500/40 to-blue-500/40',
          sparkle: 'bg-blue-400'
        };
      case 'sports':
        return {
          primary: 'from-green-600/30 to-emerald-600/30',
          secondary: 'from-green-500/10 to-emerald-500/10',
          accent1: 'border-green-500/20',
          accent2: 'border-emerald-500/20',
          glow: 'from-green-500/40 to-emerald-500/40',
          sparkle: 'bg-emerald-400'
        };
      case 'entertainment':
        return {
          primary: 'from-pink-600/30 to-purple-600/30',
          secondary: 'from-pink-500/10 to-purple-500/10',
          accent1: 'border-pink-500/20',
          accent2: 'border-purple-500/20',
          glow: 'from-pink-500/40 to-purple-500/40',
          sparkle: 'bg-pink-400'
        };
      case 'global':
        return {
          primary: 'from-amber-600/30 to-orange-600/30',
          secondary: 'from-amber-500/10 to-orange-500/10',
          accent1: 'border-amber-500/20',
          accent2: 'border-orange-500/20',
          glow: 'from-amber-500/40 to-orange-500/40',
          sparkle: 'bg-amber-400'
        };
      case 'environment':
        return {
          primary: 'from-teal-600/30 to-cyan-600/30',
          secondary: 'from-teal-500/10 to-cyan-500/10',
          accent1: 'border-teal-500/20',
          accent2: 'border-cyan-500/20',
          glow: 'from-teal-500/40 to-cyan-500/40',
          sparkle: 'bg-teal-400'
        };
      case 'technology':
        return {
          primary: 'from-violet-600/30 to-fuchsia-600/30',
          secondary: 'from-violet-500/10 to-fuchsia-500/10',
          accent1: 'border-violet-500/20',
          accent2: 'border-fuchsia-500/20',
          glow: 'from-violet-500/40 to-fuchsia-500/40',
          sparkle: 'bg-violet-400'
        };
      default:
        return {
          primary: 'from-indigo-600/30 to-blue-600/30',
          secondary: 'from-indigo-500/10 to-blue-500/10',
          accent1: 'border-indigo-500/20',
          accent2: 'border-blue-500/20',
          glow: 'from-indigo-500/40 to-blue-500/40',
          sparkle: 'bg-blue-400'
        };
    }
  };

  const colors = getCategoryColors(category);
  
  // Sparkle animation for hover effect
  const sparkleVariants = {
    initial: {
      opacity: 0,
      scale: 0,
    },
    animate: (i: number) => ({
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
      x: Math.random() * 60 - 30,
      y: Math.random() * 60 - 30,
      transition: {
        delay: i * 0.1,
        duration: 1.5,
        repeat: Infinity,
        repeatDelay: Math.random() * 2 + 1,
      },
    }),
  };

  // Generate random sparkles
  const sparkles = Array.from({ length: 12 }, (_, i) => i);

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0.8 }}
      animate={{ 
        scale: isAnalyzing ? [1, 1.05, 1] : 1,
        opacity: 1,
      }}
      transition={{ 
        duration: 2,
        repeat: isAnalyzing ? Infinity : 0,
        repeatType: "reverse"
      }}
      className="relative mb-12"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onOrbClick}
    >
      {/* Sparkles (visible on hover) */}
      <AnimatePresence>
        {isHovered && sparkles.map((i) => (
          <motion.div
            key={i}
            custom={i}
            variants={sparkleVariants}
            initial="initial"
            animate="animate"
            exit={{ opacity: 0, scale: 0 }}
            className={`absolute w-2 h-2 rounded-full ${colors.sparkle} blur-[1px] z-10`}
            style={{
              left: '50%',
              top: '50%',
              originX: '50%',
              originY: '50%',
            }}
          />
        ))}
      </AnimatePresence>

      <div className="w-64 h-64 md:w-80 md:h-80 rounded-full relative overflow-hidden cursor-pointer transition-all duration-300">
        {/* Orb outer glow */}
        <motion.div 
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${colors.primary} blur-xl`}
          animate={{
            scale: isHovered ? 1.05 : 1,
            opacity: isHovered ? 0.9 : 0.8,
          }}
          transition={{ duration: 0.3 }}
        ></motion.div>
        
        {/* Orb */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden backdrop-blur-sm border border-gray-700/50 transition-all duration-300">
          {/* Inner glow */}
          <motion.div 
            className={`absolute inset-0 rounded-full bg-gradient-to-br ${colors.secondary}`}
            animate={{
              opacity: isHovered ? 0.8 : 0.5,
            }}
            transition={{ duration: 0.3 }}
          ></motion.div>
          
          {/* Reflections */}
          <motion.div 
            className="absolute top-5 right-10 w-10 h-3 bg-white/20 rounded-full transform rotate-45"
            animate={{
              opacity: isHovered ? 0.4 : 0.2,
              width: isHovered ? 12 : 10,
            }}
            transition={{ duration: 0.3 }}
          ></motion.div>
          <motion.div 
            className="absolute top-10 left-12 w-6 h-2 bg-white/10 rounded-full transform -rotate-25"
            animate={{
              opacity: isHovered ? 0.3 : 0.1,
            }}
            transition={{ duration: 0.3 }}
          ></motion.div>
          
          {/* Mystical fog/clouds inside */}
          <motion.div
            animate={{
              opacity: isAnalyzing ? [0.4, 0.7, 0.4] : isHovered ? 0.6 : 0.4,
              scale: isAnalyzing ? [1, 1.1, 1] : isHovered ? 1.05 : 1,
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="absolute inset-8 rounded-full bg-gradient-to-t from-indigo-900/30 to-transparent"
          ></motion.div>
          
          {/* Animated swirls when analyzing or hovered */}
          {(isAnalyzing || isHovered) && (
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
                className={`absolute inset-10 rounded-full border-4 ${colors.accent1} border-dashed`}
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
                className={`absolute inset-16 rounded-full border-4 ${colors.accent2} border-dashed`}
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
                className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-r ${colors.glow} blur-md`}
              ></motion.div>
            </>
          )}
        </div>
      </div>
      
      {/* Base/stand */}
      <div className="w-32 h-8 bg-gradient-to-r from-gray-800 to-gray-700 rounded-full mx-auto -mt-4 relative z-0 transition-all duration-300">
        <div className="w-40 h-3 bg-gradient-to-r from-gray-700 to-gray-600 rounded-full mx-auto absolute -bottom-2 left-1/2 transform -translate-x-1/2"></div>
      </div>
      
      {/* Loading text */}
      {isAnalyzing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-6 text-indigo-300"
        >
          <p className="text-lg font-medium">Analyzing data patterns...</p>
          <p className="text-sm text-gray-400">Problepo is generating your prediction</p>
        </motion.div>
      )}
      
      {/* Hover instruction */}
      {isHovered && !isAnalyzing && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center bg-black/40 backdrop-blur-sm rounded-lg px-4 py-2 w-48"
        >
          <p className="text-sm">Click to activate voice input</p>
        </motion.div>
      )}
      
      {/* Magical glow effect on hover */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="absolute inset-0 rounded-full bg-white/10 filter blur-xl"
          style={{
            boxShadow: '0 0 15px rgba(255, 255, 255, 0.3)'
          }}
        />
      )}
    </motion.div>
  );
};

export default PredictionOrb;