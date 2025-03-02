import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, 
  AlertTriangle, 
  RefreshCw, 
  Filter, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight,
  Info,
  X,
  ExternalLink
} from 'lucide-react';
import { PredictionResult } from '../types';

interface DataDisplayProps {
  endpoint: string;
  title: string;
  description?: string;
  refreshInterval?: number; // in milliseconds
  initialFilters?: Record<string, string>;
  pageSize?: number;
}

const DataDisplay: React.FC<DataDisplayProps> = ({ 
  endpoint, 
  title, 
  description, 
  refreshInterval = 0, 
  initialFilters = {},
  pageSize = 10
}) => {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>(initialFilters);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Determine the data type and structure
  const [dataType, setDataType] = useState<'array' | 'object' | 'prediction' | 'unknown'>('unknown');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters from filters
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      // Add pagination parameters
      queryParams.append('page', currentPage.toString());
      queryParams.append('pageSize', pageSize.toString());

      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const response = await fetch(`${endpoint}${queryString}`);

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const result = await response.json();
      
      // Determine data type
      if (Array.isArray(result)) {
        setDataType('array');
        setData(result);
        // Calculate total pages based on total count if provided in headers
        const totalCount = response.headers.get('X-Total-Count');
        if (totalCount) {
          setTotalPages(Math.ceil(parseInt(totalCount) / pageSize));
        } else {
          setTotalPages(Math.ceil(result.length / pageSize));
        }
      } else if (result && typeof result === 'object') {
        if (result.prediction && result.confidence !== undefined) {
          setDataType('prediction');
          setData([result]); // Wrap in array for consistent handling
        } else {
          setDataType('object');
          setData([result]); // Wrap in array for consistent handling
        }
        setTotalPages(1);
      } else {
        setDataType('unknown');
        setData(null);
        setError('Unexpected data format received from API');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Set up refresh interval if specified
    if (refreshInterval > 0) {
      const intervalId = setInterval(fetchData, refreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [endpoint, currentPage, JSON.stringify(filters), refreshInterval]);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
    
    // Sort the data
    if (data) {
      const sortedData = [...data].sort((a, b) => {
        if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
        if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
        return 0;
      });
      
      setData(sortedData);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
  };

  const closeItemDetails = () => {
    setSelectedItem(null);
  };

  // Render loading state
  if (loading && !data) {
    return (
      <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 backdrop-blur-sm border border-gray-700 w-full max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 text-indigo-500 animate-spin mb-4" />
          <h3 className="text-xl font-medium text-white">Loading data...</h3>
          <p className="text-gray-400 mt-2">Fetching the latest information from {endpoint}</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 backdrop-blur-sm border border-red-700 w-full max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center py-8">
          <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-xl font-medium text-white">Error Loading Data</h3>
          <p className="text-red-400 mt-2">{error}</p>
          <button 
            onClick={handleRefresh}
            className="mt-6 px-4 py-2 bg-indigo-700 hover:bg-indigo-600 rounded-lg flex items-center text-white transition-colors"
            aria-label="Retry loading data"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Render empty state
  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 backdrop-blur-sm border border-gray-700 w-full max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center py-12">
          <Info className="h-12 w-12 text-gray-500 mb-4" />
          <h3 className="text-xl font-medium text-white">No Data Available</h3>
          <p className="text-gray-400 mt-2">There is no data to display for the current filters</p>
          {Object.keys(filters).length > 0 && (
            <button 
              onClick={() => setFilters({})}
              className="mt-6 px-4 py-2 bg-indigo-700 hover:bg-indigo-600 rounded-lg flex items-center text-white transition-colors"
              aria-label="Clear filters"
            >
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </button>
          )}
        </div>
      </div>
    );
  }

  // Render item details modal
  const renderItemDetails = () => {
    if (!selectedItem) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={closeItemDetails}
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">
              {selectedItem.title || selectedItem.name || selectedItem.id || 'Item Details'}
            </h3>
            <button 
              onClick={closeItemDetails}
              className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700 transition-colors"
              aria-label="Close details"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            {Object.entries(selectedItem).map(([key, value]) => {
              // Skip rendering certain fields or complex objects
              if (key === 'id' || typeof value === 'function') return null;
              
              return (
                <div key={key} className="border-b border-gray-700 pb-3">
                  <h4 className="text-sm font-medium text-gray-400 mb-1 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </h4>
                  <div className="text-white">
                    {renderValue(value)}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 flex justify-end">
            <button 
              onClick={closeItemDetails}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // Helper function to render different value types
  const renderValue = (value: any): React.ReactNode => {
    if (value === null || value === undefined) {
      return <span className="text-gray-500 italic">Not available</span>;
    }
    
    if (typeof value === 'boolean') {
      return value ? 
        <span className="text-green-400">Yes</span> : 
        <span className="text-red-400">No</span>;
    }
    
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        if (value.length === 0) {
          return <span className="text-gray-500 italic">Empty array</span>;
        }
        
        return (
          <ul className="list-disc pl-5 space-y-1">
            {value.map((item, index) => (
              <li key={index}>
                {typeof item === 'object' ? JSON.stringify(item) : String(item)}
              </li>
            ))}
          </ul>
        );
      }
      
      // Handle date objects
      if (value instanceof Date) {
        return value.toLocaleString();
      }
      
      // For other objects
      return (
        <div className="bg-gray-900 p-2 rounded text-sm overflow-x-auto">
          <pre>{JSON.stringify(value, null, 2)}</pre>
        </div>
      );
    }
    
    // Handle URLs
    if (typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://'))) {
      return (
        <a 
          href={value} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-indigo-400 hover:text-indigo-300 flex items-center"
        >
          {value}
          <ExternalLink className="h-3 w-3 ml-1" />
        </a>
      );
    }
    
    // Default string/number rendering
    return String(value);
  };

  // Render prediction data (special case)
  if (dataType === 'prediction' && data && data[0]) {
    const prediction = data[0] as PredictionResult;
    
    return (
      <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 backdrop-blur-sm border border-gray-700 w-full max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            {description && <p className="text-gray-400 mt-1">{description}</p>}
          </div>
          <button 
            onClick={handleRefresh}
            className="p-2 bg-indigo-700 hover:bg-indigo-600 rounded-lg flex items-center text-white transition-colors"
            aria-label="Refresh data"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        <div className="bg-indigo-900 bg-opacity-30 rounded-lg p-6 border border-indigo-800/30 mb-6">
          <h3 className="text-lg font-medium mb-3 text-center">Prediction for {prediction.topic}</h3>
          <p className="text-center text-lg">{prediction.prediction}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-900 bg-opacity-60 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-3 flex items-center">
              Confidence Level
            </h3>
            <div className="flex items-center">
              <div className="w-full bg-gray-700 rounded-full h-4 mr-3">
                <motion.div 
                  className={`h-4 rounded-full ${
                    prediction.confidence >= 75 ? 'bg-green-500' : 
                    prediction.confidence >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${prediction.confidence}%` }}
                  transition={{ duration: 0.8 }}
                ></motion.div>
              </div>
              <span className="text-xl font-bold">
                {prediction.confidence}%
              </span>
            </div>
          </div>
          
          <div className="bg-gray-900 bg-opacity-60 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-3 flex items-center">
              Category & Timeframe
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-indigo-900/50 rounded-full">
                {prediction.category}
              </span>
              <span className="px-3 py-1 bg-indigo-900/50 rounded-full">
                {prediction.timeframe}
              </span>
            </div>
          </div>
        </div>
        
        {/* Additional prediction data sections */}
        {prediction.dataPoints && prediction.dataPoints.length > 0 && (
          <div className="bg-gray-900 bg-opacity-60 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium mb-3">Supporting Data Points</h3>
            <ul className="list-disc pl-5 space-y-2">
              {prediction.dataPoints.map((point, index) => (
                <motion.li 
                  key={index} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {point}
                </motion.li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="text-sm text-gray-400 mt-4 flex justify-between items-center">
          <span>Last updated: {prediction.lastUpdated}</span>
          <span>API: {endpoint}</span>
        </div>
      </div>
    );
  }

  // Render table for array data
  return (
    <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 backdrop-blur-sm border border-gray-700 w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          {description && <p className="text-gray-400 mt-1">{description}</p>}
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center text-white transition-colors"
            aria-label="Toggle filters"
          >
            <Filter className="h-4 w-4" />
          </button>
          <button 
            onClick={handleRefresh}
            className="p-2 bg-indigo-700 hover:bg-indigo-600 rounded-lg flex items-center text-white transition-colors"
            aria-label="Refresh data"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      
      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <h3 className="text-lg font-medium mb-3 text-white">Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data && data[0] && Object.keys(data[0]).slice(0, 6).map(key => (
                  <div key={key} className="space-y-1">
                    <label htmlFor={`filter-${key}`} className="block text-sm font-medium text-gray-300">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </label>
                    <input
                      type="text"
                      id={`filter-${key}`}
                      value={filters[key] || ''}
                      onChange={(e) => handleFilterChange(key, e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder={`Filter by ${key}`}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setFilters({})}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Loading overlay */}
      {loading && (
        <div className="relative mb-4">
          <div className="absolute inset-0 bg-gray-900 bg-opacity-30 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
          </div>
        </div>
      )}
      
      {/* Data table */}
      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-900">
            <tr>
              {data && data[0] && Object.keys(data[0]).slice(0, 8).map(key => (
                <th 
                  key={key}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-800 transition-colors"
                  onClick={() => handleSort(key)}
                >
                  <div className="flex items-center">
                    <span>{key}</span>
                    {sortConfig && sortConfig.key === key && (
                      <ArrowUpDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
              ))}
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 bg-opacity-50 divide-y divide-gray-700">
            {data.map((item, index) => (
              <tr 
                key={index}
                className="hover:bg-gray-700 transition-colors cursor-pointer"
                onClick={() => handleItemClick(item)}
              >
                {Object.entries(item).slice(0, 8).map(([key, value]) => (
                  <td key={key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {typeof value === 'object' ? 
                      (value === null ? 'N/A' : JSON.stringify(value).substring(0, 50) + '...') : 
                      String(value).substring(0, 50) + (String(value).length > 50 ? '...' : '')}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleItemClick(item);
                    }}
                    className="text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-400">
            Showing page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-md ${
                currentPage === 1 ? 'text-gray-500 cursor-not-allowed' : 'text-white hover:bg-gray-700'
              }`}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            {/* Page numbers */}
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Show pages around current page
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 flex items-center justify-center rounded-md ${
                      currentPage === pageNum ? 'bg-indigo-700 text-white' : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-md ${
                currentPage === totalPages ? 'text-gray-500 cursor-not-allowed' : 'text-white hover:bg-gray-700'
              }`}
              aria-label="Next page"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
      
      {/* Item details modal */}
      <AnimatePresence>
        {selectedItem && renderItemDetails()}
      </AnimatePresence>
    </div>
  );
};

export default DataDisplay;