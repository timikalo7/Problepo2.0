import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, 
  AlertTriangle, 
  RefreshCw, 
  Download, 
  Copy, 
  Check,
  ChevronDown,
  ChevronUp,
  Code,
  Eye,
  Table,
  BarChart4,
  List
} from 'lucide-react';

interface ApiResponseVisualizerProps {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  requestBody?: object;
  headers?: Record<string, string>;
  title?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
  visualizationType?: 'json' | 'table' | 'chart' | 'list';
}

const ApiResponseVisualizer: React.FC<ApiResponseVisualizerProps> = ({
  endpoint,
  method = 'GET',
  requestBody,
  headers = {},
  title = 'API Response',
  autoRefresh = false,
  refreshInterval = 30000, // 30 seconds default
  visualizationType: initialVisualizationType = 'json'
}) => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<boolean>(true);
  const [visualizationType, setVisualizationType] = useState<'json' | 'table' | 'chart' | 'list'>(initialVisualizationType);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const requestOptions: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        ...(method !== 'GET' && requestBody ? { body: JSON.stringify(requestBody) } : {})
      };

      const response = await fetch(endpoint, requestOptions);

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      setLastUpdated(new Date().toLocaleString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Set up auto-refresh if enabled
    if (autoRefresh && refreshInterval > 0) {
      intervalRef.current = setInterval(fetchData, refreshInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [endpoint, method, JSON.stringify(requestBody), JSON.stringify(headers), autoRefresh, refreshInterval]);

  const handleRefresh = () => {
    fetchData();
  };

  const handleCopyToClipboard = () => {
    if (data) {
      navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (data) {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `api-response-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Render JSON view
  const renderJsonView = () => {
    return (
      <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm text-gray-300 max-h-[500px] overflow-y-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  };

  // Render table view
  const renderTableView = () => {
    if (!data) return null;

    // Handle array of objects
    if (Array.isArray(data)) {
      if (data.length === 0) {
        return <p className="text-gray-400 italic">No data to display</p>;
      }

      // Get all unique keys from all objects in the array
      const allKeys = Array.from(
        new Set(
          data.flatMap(item => 
            typeof item === 'object' && item !== null ? Object.keys(item) : []
          )
        )
      );

      return (
        <div className="overflow-x-auto rounded-lg border border-gray-700">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900">
              <tr>
                {allKeys.map(key => (
                  <th 
                    key={key}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {data.map((item, index) => (
                <tr key={index}>
                  {allKeys.map(key => (
                    <td key={key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {item && typeof item === 'object' && key in item
                        ? typeof item[key] === 'object'
                          ? JSON.stringify(item[key])
                          : String(item[key])
                        : 'N/A'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // Handle single object
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      return (
        <div className="overflow-x-auto rounded-lg border border-gray-700">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Value
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {Object.entries(data).map(([key, value]) => (
                <tr key={key}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-300">
                    {key}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {typeof value === 'object'
                      ? JSON.stringify(value)
                      : String(value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return <p className="text-gray-400 italic">Data format not suitable for table view</p>;
  };

  // Render list view
  const renderListView = () => {
    if (!data) return null;

    // Handle array of objects or values
    if (Array.isArray(data)) {
      if (data.length === 0) {
        return <p className="text-gray-400 italic">No data to display</p>;
      }

      return (
        <ul className="space-y-2 bg-gray-900 rounded-lg p-4">
          {data.map((item, index) => (
            <li key={index} className="border-b border-gray-800 pb-2">
              {typeof item === 'object' && item !== null
                ? JSON.stringify(item)
                : String(item)}
            </li>
          ))}
        </ul>
      );
    }

    // Handle single object
    if (data && typeof data === 'object') {
      return (
        <ul className="space-y-2 bg-gray-900 rounded-lg p-4">
          {Object.entries(data).map(([key, value]) => (
            <li key={key} className="border-b border-gray-800 pb-2">
              <span className="font-medium text-gray-300">{key}: </span>
              <span className="text-gray-400">
                {typeof value === 'object'
                  ? JSON.stringify(value)
                  : String(value)}
              </span>
            </li>
          ))}
        </ul>
      );
    }

    return <p className="text-gray-400 italic">Data format not suitable for list view</p>;
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold text-gray-200">{title}</h2>
            {loading && (
              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
            )}
            {error && (
              <AlertTriangle className="w-4 h-4 text-red-500" />
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              className="p-2 text-gray-400 hover:text-gray-200 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopyToClipboard}
              className="p-2 text-gray-400 hover:text-gray-200 transition-colors"
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={handleDownload}
              className="p-2 text-gray-400 hover:text-gray-200 transition-colors"
              title="Download JSON"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 text-gray-400 hover:text-gray-200 transition-colors"
              title={expanded ? "Collapse" : "Expand"}
            >
              {expanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
        {lastUpdated && (
          <p className="text-xs text-gray-400 mt-1">
            Last updated: {lastUpdated}
          </p>
        )}
        <div className="flex space-x-2 mt-4">
          <button
            onClick={() => setVisualizationType('json')}
            className={`flex items-center space-x-1 px-3 py-1 rounded ${
              visualizationType === 'json'
                ? 'bg-gray-700 text-gray-200'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>JSON</span>
          </button>
          <button
            onClick={() => setVisualizationType('table')}
            className={`flex items-center space-x-1 px-3 py-1 rounded ${
              visualizationType === 'table'
                ? 'bg-gray-700 text-gray-200'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>Table</span>
          </button>
          <button
            onClick={() => setVisualizationType('list')}
            className={`flex items-center space-x-1 px-3 py-1 rounded ${
              visualizationType === 'list'
                ? 'bg-gray-700 text-gray-200'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <List className="w-4 h-4" />
            <span>List</span>
          </button>
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="p-4"
          >
            {error ? (
              <div className="text-red-500 bg-red-500/10 rounded-lg p-4">
                {error}
              </div>
            ) : (
              <>
                {visualizationType === 'json' && renderJsonView()}
                {visualizationType === 'table' && renderTableView()}
                {visualizationType === 'list' && renderListView()}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ApiResponseVisualizer;