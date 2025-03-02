import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Database, 
  BarChart, 
  Globe, 
  Thermometer, 
  Cpu, 
  Briefcase,
  Loader2
} from 'lucide-react';
import DataDisplay from './DataDisplay';

interface ApiEndpoint {
  id: string;
  name: string;
  description: string;
  url: string;
  category: 'finance' | 'sports' | 'entertainment' | 'global' | 'environment' | 'technology';
  refreshInterval?: number;
  icon: React.ReactNode;
}

const ApiDataExplorer: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null);
  const [loading, setLoading] = useState(false);

  // Define available API endpoints
  const apiEndpoints: ApiEndpoint[] = [
    {
      id: 'finance-prediction',
      name: 'Finance Market Prediction',
      description: 'Get predictions for financial markets and investment opportunities using DeepSeek AI',
      url: '/api/predict',
      category: 'finance',
      icon: <Briefcase className="h-5 w-5" />
    },
    {
      id: 'sports-prediction',
      name: 'Sports Outcome Prediction',
      description: 'Get predictions for sports events and competitions using DeepSeek AI',
      url: '/api/predict',
      category: 'sports',
      icon: <BarChart className="h-5 w-5" />
    },
    {
      id: 'entertainment-prediction',
      name: 'Entertainment Trends',
      description: 'Get predictions for entertainment industry trends and outcomes using DeepSeek AI',
      url: '/api/predict',
      category: 'entertainment',
      icon: <Globe className="h-5 w-5" />
    },
    {
      id: 'global-prediction',
      name: 'Global Events Prediction',
      description: 'Get predictions for global political and economic events using DeepSeek AI',
      url: '/api/predict',
      category: 'global',
      icon: <Globe className="h-5 w-5" />
    },
    {
      id: 'environment-prediction',
      name: 'Environmental Trends',
      description: 'Get predictions for climate and environmental changes using DeepSeek AI',
      url: '/api/predict',
      category: 'environment',
      icon: <Thermometer className="h-5 w-5" />
    },
    {
      id: 'technology-prediction',
      name: 'Technology Innovation Forecast',
      description: 'Get predictions for technology advancements and market trends using DeepSeek AI',
      url: '/api/predict',
      category: 'technology',
      icon: <Cpu className="h-5 w-5" />
    },
    {
      id: 'api-status',
      name: 'API Status Dashboard',
      description: 'View the current status of all connected APIs and services',
      url: '/api/status',
      category: 'technology',
      refreshInterval: 60000, // Refresh every minute
      icon: <Database className="h-5 w-5" />
    }
  ];

  // Filter endpoints based on search and category
  const filteredEndpoints = apiEndpoints.filter(endpoint => {
    const matchesSearch = endpoint.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         endpoint.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || endpoint.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEndpointSelect = (endpoint: ApiEndpoint) => {
    setLoading(true);
    setSelectedEndpoint(endpoint);
    // Simulate loading delay
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const handleBackToList = () => {
    setSelectedEndpoint(null);
  };

  // Categories with their icons for the filter buttons
  const categories = [
    { id: 'finance', name: 'Finance', icon: <Briefcase className="h-4 w-4 mr-2" /> },
    { id: 'sports', name: 'Sports', icon: <BarChart className="h-4 w-4 mr-2" /> },
    { id: 'entertainment', name: 'Entertainment', icon: <Globe className="h-4 w-4 mr-2" /> },
    { id: 'global', name: 'Global', icon: <Globe className="h-4 w-4 mr-2" /> },
    { id: 'environment', name: 'Environment', icon: <Thermometer className="h-4 w-4 mr-2" /> },
    { id: 'technology', name: 'Technology', icon: <Cpu className="h-4 w-4 mr-2" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-indigo-900 text-white p-6">
      <div className="container mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-500">
            API Data Explorer
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Explore and visualize data from DeepSeek AI prediction APIs
          </p>
        </header>

        {selectedEndpoint ? (
          <div>
            <button
              onClick={handleBackToList}
              className="mb-6 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center text-white transition-colors"
            >
              ← Back to API List
            </button>
            
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-12 w-12 text-indigo-500 animate-spin" />
              </div>
            ) : (
              <DataDisplay
                endpoint={selectedEndpoint.url}
                title={selectedEndpoint.name}
                description={selectedEndpoint.description}
                refreshInterval={selectedEndpoint.refreshInterval}
                initialFilters={
                  selectedEndpoint.category === 'finance' ? { category: 'finance' } :
                  selectedEndpoint.category === 'sports' ? { category: 'sports' } :
                  selectedEndpoint.category === 'entertainment' ? { category: 'entertainment' } :
                  selectedEndpoint.category === 'global' ? { category: 'global' } :
                  selectedEndpoint.category === 'environment' ? { category: 'environment' } :
                  selectedEndpoint.category === 'technology' ? { category: 'technology' } :
                  {}
                }
              />
            )}
          </div>
        ) : (
          <div>
            {/* Search and filter */}
            <div className="mb-8">
              <div className="relative flex items-center mb-6">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search APIs by name or description..."
                  className="block w-full pl-10 pr-4 py-3 rounded-lg bg-gray-800 bg-opacity-50 border border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === null
                      ? 'bg-indigo-700 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  All Categories
                </button>
                
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg flex items-center transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-indigo-700 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {category.icon}
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* API endpoint cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEndpoints.map(endpoint => (
                <motion.div
                  key={endpoint.id}
                  whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(124, 58, 237, 0.5)" }}
                  className="bg-gray-800 bg-opacity-50 rounded-xl p-6 backdrop-blur-sm border border-gray-700 cursor-pointer transition-all duration-300 hover:border-indigo-500"
                  onClick={() => handleEndpointSelect(endpoint)}
                >
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-indigo-900 rounded-lg mr-4">
                      {endpoint.icon}
                    </div>
                    <h3 className="text-xl font-semibold">{endpoint.name}</h3>
                  </div>
                  <p className="text-gray-300 mb-4">{endpoint.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-indigo-400 capitalize">{endpoint.category}</span>
                    <button
                      className="px-4 py-2 bg-indigo-700 hover:bg-indigo-600 rounded-lg text-sm transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEndpointSelect(endpoint);
                      }}
                    >
                      Explore Data
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {filteredEndpoints.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No APIs found matching your search criteria.</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory(null);
                  }}
                  className="mt-4 px-4 py-2 bg-indigo-700 hover:bg-indigo-600 rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiDataExplorer;