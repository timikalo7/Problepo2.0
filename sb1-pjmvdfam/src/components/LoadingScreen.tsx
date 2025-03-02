import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

interface LoadingScreenProps {
  onLoadingComplete: () => void;
  logoUrl?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  onLoadingComplete,
  logoUrl = "https://stackblitz.com/storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBd0xZYkE9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--bc18befae72e3e2aa8cb4c7c6ac001408f6b6bc2/logo.png"
}) => {
  useEffect(() => {
    // Simulate loading time (you can replace this with actual loading logic)
    const timer = setTimeout(() => {
      onLoadingComplete();
    }, 2500);
    
    return () => clearTimeout(timer);
  }, [onLoadingComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-indigo-900 via-purple-900 to-indigo-900"
    >
      <div className="relative mb-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-600/30 to-blue-600/30 blur-xl absolute inset-0"
        />
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-32 h-32 rounded-full relative overflow-hidden"
        >
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden backdrop-blur-sm border border-gray-700/50">
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
              className="absolute inset-4 rounded-full border-4 border-indigo-500/20 border-dashed"
            />
            
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
              className="absolute inset-8 rounded-full border-4 border-blue-500/20 border-dashed"
            />
            
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
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500/40 to-blue-500/40 blur-md"
            />
          </div>
        </motion.div>
      </div>
      
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-500 flex items-center justify-center font-['Poppins',sans-serif]"
      >
        <span>Pr</span>
        <img 
          src={logoUrl} 
          alt="o" 
          className="w-10 h-10 inline-block mx-[-2px] transform translate-y-[2px]" 
        />
        <span>blepo</span>
      </motion.h1>
      
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: "80%" }}
        transition={{ duration: 2, ease: "easeInOut" }}
        className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 rounded-full max-w-xs"
      />
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ delay: 0.5, duration: 2, repeat: Infinity }}
        className="mt-4 text-indigo-300 text-sm"
      >
        Consulting the digital oracle...
      </motion.p>
    </motion.div>
  );
};

export default LoadingScreen;