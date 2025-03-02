import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Percent,
  BarChart2,
  History,
  GitBranch
} from 'lucide-react';
import { PredictionResult } from '../types';

interface ResultsDisplayProps {
  results: PredictionResult;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 75) return 'text-green-400';
    if (confidence >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const formatTimeframe = (timeframe: string) => {
    switch (timeframe) {
      case '1week': return '1 Week';
      case '1month': return '1 Month';
      case '3months': return '3 Months';
      case '6months': return '6 Months';
      case '1year': return '1 Year';
      case '5years': return '5 Years';
      default: return timeframe;
    }
  };

  const formatCategory = (category: string) => {
    switch (category) {
      case 'finance': return 'Finance & Markets';
      case 'sports': return 'Sports & Competitions';
      case 'entertainment': return 'Entertainment & Media';
      case 'global': return 'Global Events & Politics';
      case 'environment': return 'Environment & Climate';
      case 'technology': return 'Technology & Science';
      default: return category;
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="w-full max-w-3xl bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl p-6 border border-gray-700 transition-all duration-300 hover:border-indigo-700/50"
    >
      <motion.div variants={item} className="mb-6">
        <h2 className="text-2xl font-bold text-center mb-2">
          {results.topic}
        </h2>
        <div className="flex flex-wrap justify-center items-center gap-2 text-gray-400 text-sm">
          <span className="px-3 py-1 bg-gray-700 rounded-full transition-all duration-300 hover:bg-gray-600">{formatCategory(results.category)}</span>
          <span className="px-3 py-1 bg-gray-700 rounded-full flex items-center transition-all duration-300 hover:bg-gray-600">
            <Calendar className="inline h-3 w-3 mr-1" />
            {formatTimeframe(results.timeframe)}
          </span>
          <span className="px-3 py-1 bg-gray-700 rounded-full transition-all duration-300 hover:bg-gray-600">
            Last updated: {results.lastUpdated}
          </span>
        </div>
      </motion.div>

      <motion.div 
        variants={item} 
        className="bg-indigo-900 bg-opacity-30 rounded-lg p-6 border border-indigo-800/30 mb-6 transition-all duration-300 hover:bg-indigo-900/40 hover:border-indigo-700/40"
        whileHover={{ 
          boxShadow: "0 0 15px rgba(99, 102, 241, 0.2)",
          y: -2
        }}
      >
        <h3 className="text-lg font-medium mb-3 text-center">Prediction</h3>
        <p className="text-center text-lg">{results.prediction}</p>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <motion.div 
          className="bg-gray-900 bg-opacity-60 rounded-lg p-4 transition-all duration-300 hover:bg-gray-900/80"
          whileHover={{ 
            boxShadow: "0 0 15px rgba(255, 255, 255, 0.1)",
            y: -2
          }}
        >
          <h3 className="text-lg font-medium mb-3 flex items-center">
            <Percent className="h-5 w-5 mr-2 text-indigo-400" />
            Confidence Level
          </h3>
          <div className="flex items-center">
            <div className="w-full bg-gray-700 rounded-full h-4 mr-3">
              <motion.div 
                className={`h-4 rounded-full ${
                  results.confidence >= 75 ? 'bg-green-500' : 
                  results.confidence >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                } transition-all duration-500 ease-in-out`}
                initial={{ width: 0 }}
                animate={{ width: `${results.confidence}%` }}
                transition={{ duration: 0.8 }}
              ></motion.div>
            </div>
            <span className={`text-xl font-bold ${getConfidenceColor(results.confidence)}`}>
              {results.confidence}%
            </span>
          </div>
        </motion.div>

        <motion.div 
          className="bg-gray-900 bg-opacity-60 rounded-lg p-4 transition-all duration-300 hover:bg-gray-900/80"
          whileHover={{ 
            boxShadow: "0 0 15px rgba(255, 255, 255, 0.1)",
            y: -2
          }}
        >
          <h3 className="text-lg font-medium mb-3 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-indigo-400" />
            Trend Direction
          </h3>
          <div className="flex items-center">
            {results.trend === 'up' ? (
              <div className="flex items-center text-green-400">
                <TrendingUp className="h-6 w-6 mr-2" />
                <span className="text-xl font-bold">Upward</span>
              </div>
            ) : results.trend === 'down' ? (
              <div className="flex items-center text-red-400">
                <TrendingDown className="h-6 w-6 mr-2" />
                <span className="text-xl font-bold">Downward</span>
              </div>
            ) : (
              <div className="flex items-center text-yellow-400">
                <span className="text-xl font-bold">Stable/Neutral</span>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {results.dataPoints && results.dataPoints.length > 0 && (
        <motion.div 
          variants={item} 
          className="bg-gray-900 bg-opacity-60 rounded-lg p-4 mb-6 transition-all duration-300 hover:bg-gray-900/80"
          whileHover={{ 
            boxShadow: "0 0 15px rgba(255, 255, 255, 0.1)",
            y: -2
          }}
        >
          <h3 className="text-lg font-medium mb-3 flex items-center">
            <BarChart2 className="h-5 w-5 mr-2 text-indigo-400" />
            Supporting Data Points
          </h3>
          <ul className="list-disc pl-5 space-y-2">
            {results.dataPoints.map((point, index) => (
              <motion.li 
                key={index} 
                className="transition-all duration-300 hover:text-indigo-300"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {point}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}

      {results.variables && results.variables.length > 0 && (
        <motion.div 
          variants={item} 
          className="bg-gray-900 bg-opacity-60 rounded-lg p-4 mb-6 transition-all duration-300 hover:bg-gray-900/80"
          whileHover={{ 
            boxShadow: "0 0 15px rgba(255, 255, 255, 0.1)",
            y: -2
          }}
        >
          <h3 className="text-lg font-medium mb-3 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-indigo-400" />
            Variables That Could Affect Outcome
          </h3>
          <ul className="list-disc pl-5 space-y-2">
            {results.variables.map((variable, index) => (
              <motion.li 
                key={index} 
                className="transition-all duration-300 hover:text-indigo-300"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {variable}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}

      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {results.historicalPatterns && results.historicalPatterns.length > 0 && (
          <motion.div 
            className="bg-gray-900 bg-opacity-60 rounded-lg p-4 transition-all duration-300 hover:bg-gray-900/80"
            whileHover={{ 
              boxShadow: "0 0 15px rgba(255, 255, 255, 0.1)",
              y: -2
            }}
          >
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <History className="h-5 w-5 mr-2 text-indigo-400" />
              Historical Patterns
            </h3>
            <ul className="list-disc pl-5 space-y-2">
              {results.historicalPatterns.map((pattern, index) => (
                <motion.li 
                  key={index} 
                  className="transition-all duration-300 hover:text-indigo-300"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {pattern}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}

        {results.alternativeScenarios && results.alternativeScenarios.length > 0 && (
          <motion.div 
            className="bg-gray-900 bg-opacity-60 rounded-lg p-4 transition-all duration-300 hover:bg-gray-900/80"
            whileHover={{ 
              boxShadow: "0 0 15px rgba(255, 255, 255, 0.1)",
              y: -2
            }}
          >
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <GitBranch className="h-5 w-5 mr-2 text-indigo-400" />
              Alternative Scenarios
            </h3>
            <ul className="list-disc pl-5 space-y-2">
              {results.alternativeScenarios.map((scenario, index) => (
                <motion.li 
                  key={index} 
                  className="transition-all duration-300 hover:text-indigo-300"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {scenario}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </motion.div>

      <motion.div 
        variants={item} 
        className="bg-gray-700 bg-opacity-40 rounded-lg p-4 text-sm text-gray-300 italic transition-all duration-300 hover:bg-gray-700/50"
      >
        <p className="flex items-center">
          <AlertTriangle className="h-4 w-4 mr-2 text-yellow-400" />
          Disclaimer: This prediction is speculative and based on available data and algorithmic analysis. 
          It should not be taken as a guaranteed outcome. Always conduct your own research before making decisions.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default ResultsDisplay;