import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, HelpCircle } from 'lucide-react';
import { ApiStatus } from '../types';

interface ApiStatusIndicatorProps {
  apiStatuses: ApiStatus[];
}

const ApiStatusIndicator: React.FC<ApiStatusIndicatorProps> = ({ apiStatuses }) => {
  if (!apiStatuses || apiStatuses.length === 0) {
    return (
      <div className="bg-gray-800 p-4 rounded-xl text-white">
        No API status information available.
      </div>
    );
  }

  return (
    <div className="bg-gray-800 bg-opacity-50 rounded-xl p-4 backdrop-blur-sm border border-gray-700">
      <h3 className="text-lg font-medium mb-3 text-white">API Connections</h3>
      
      <div className="space-y-2">
        {apiStatuses.map((api, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-2 rounded-lg bg-gray-700 bg-opacity-50"
          >
            <span className="text-gray-200">{api.name}</span>
            <div className="flex items-center">
              {api.status === 'connected' && (
                <span className="flex items-center text-green-400 text-sm">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Connected
                </span>
              )}
              {api.status === 'error' && (
                <span className="flex items-center text-red-400 text-sm" title={api.message}>
                  <XCircle className="h-4 w-4 mr-1" />
                  Error
                </span>
              )}
              {api.status === 'disabled' && (
                <span className="flex items-center text-gray-400 text-sm">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Disabled
                </span>
              )}
              {api.status === 'unknown' && (
                <span className="flex items-center text-yellow-400 text-sm">
                  <HelpCircle className="h-4 w-4 mr-1" />
                  Unknown
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-3 text-xs text-gray-400 italic">
        Note: API connection statuses reflect real-time connection checks.
      </div>
    </div>
  );
};

export default ApiStatusIndicator;