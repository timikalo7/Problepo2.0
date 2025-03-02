import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2 } from 'lucide-react';

interface PipelineStep {
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress?: number;
}

interface ProcessingPipelineProps {
  steps: PipelineStep[];
  isProcessing: boolean;
}

const ProcessingPipeline: React.FC<ProcessingPipelineProps> = ({ steps, isProcessing }) => {
  if (!isProcessing && steps.every(step => step.status === 'pending')) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-800 bg-opacity-50 rounded-xl p-4 backdrop-blur-sm border border-gray-700 mb-6"
    >
      <h3 className="text-lg font-medium mb-3 text-white">Processing Pipeline</h3>
      
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={index} className="relative">
            {index < steps.length - 1 && (
              <div className={`absolute left-3 top-6 w-0.5 h-full ${
                steps[index].status === 'completed' && steps[index + 1].status === 'completed'
                  ? 'bg-green-500'
                  : steps[index].status === 'completed'
                  ? 'bg-indigo-500'
                  : 'bg-gray-700'
              }`}></div>
            )}
            
            <div className="flex items-start">
              <div className="relative flex items-center justify-center w-6 h-6 rounded-full mr-3 mt-1">
                {step.status === 'pending' && (
                  <div className="w-6 h-6 rounded-full bg-gray-700"></div>
                )}
                {step.status === 'processing' && (
                  <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                )}
                {step.status === 'completed' && (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                )}
                {step.status === 'error' && (
                  <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                    <span className="text-white text-xs">!</span>
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className={`font-medium ${
                    step.status === 'completed' 
                      ? 'text-green-400' 
                      : step.status === 'processing'
                      ? 'text-indigo-400'
                      : step.status === 'error'
                      ? 'text-red-400'
                      : 'text-gray-400'
                  }`}>
                    {step.name}
                  </span>
                  
                  {step.status === 'processing' && step.progress !== undefined && (
                    <span className="text-xs text-indigo-400">{step.progress}%</span>
                  )}
                </div>
                
                {step.status === 'processing' && (
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <motion.div 
                      className="h-1.5 rounded-full bg-indigo-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${step.progress || 0}%` }}
                      transition={{ duration: 0.3 }}
                    ></motion.div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default ProcessingPipeline;