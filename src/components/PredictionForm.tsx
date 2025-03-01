import React from 'react';
import { motion } from 'framer-motion';
import { PredictionRequest } from '../types';

interface PredictionFormProps {
  predictionRequest: PredictionRequest;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const PredictionForm: React.FC<PredictionFormProps> = ({ predictionRequest, handleInputChange }) => {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-800 bg-opacity-50 rounded-xl p-6 mb-6 backdrop-blur-sm border border-gray-700 transition-all duration-300 hover:border-indigo-700/50 hover:bg-gray-800/60"
    >
      <h3 className="text-lg font-medium mb-4">Prediction Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={predictionRequest.category}
            onChange={handleInputChange}
            className="w-full bg-gray-700 bg-opacity-50 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 hover:border-indigo-500/50"
          >
            <option value="finance">Finance & Markets</option>
            <option value="sports">Sports & Competitions</option>
            <option value="entertainment">Entertainment & Media</option>
            <option value="global">Global Events & Politics</option>
            <option value="environment">Environment & Climate</option>
            <option value="technology">Technology & Science</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="timeframe" className="block text-sm font-medium text-gray-300 mb-1">
            Timeframe
          </label>
          <select
            id="timeframe"
            name="timeframe"
            value={predictionRequest.timeframe}
            onChange={handleInputChange}
            className="w-full bg-gray-700 bg-opacity-50 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 hover:border-indigo-500/50"
          >
            <option value="1week">1 Week</option>
            <option value="1month">1 Month</option>
            <option value="3months">3 Months</option>
            <option value="6months">6 Months</option>
            <option value="1year">1 Year</option>
            <option value="5years">5 Years</option>
          </select>
        </div>
      </div>
      
      <div>
        <label htmlFor="context" className="block text-sm font-medium text-gray-300 mb-1">
          Additional Context (optional)
        </label>
        <textarea
          id="context"
          name="context"
          value={predictionRequest.context}
          onChange={handleInputChange}
          rows={3}
          placeholder="Add any relevant details or specific aspects you're interested in..."
          className="w-full bg-gray-700 bg-opacity-50 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 hover:border-indigo-500/50"
        ></textarea>
      </div>
    </motion.div>
  );
};

export default PredictionForm;