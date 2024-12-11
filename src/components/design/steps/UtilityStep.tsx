import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getUtilityData } from '../../../utils/api';
import { useDesignStore } from '../../../store/designStore';
import { Zap, AlertCircle, RefreshCcw } from 'lucide-react';
import { calculateSystemRequirements } from '../../../utils/calculations';

interface UtilityProvider {
  utility_name: string;
  company_id: string;
  utility_type: string;
}

export const UtilityStep: React.FC = () => {
  const { 
    zipCode, 
    setUtilityProvider, 
    setElectricityRate,
    setBaseCost,
    monthlyBill,
    setPanelCount,
    setSystemSize,
    electricityRate,
    baseCost
  } = useDesignStore();
  const navigate = useNavigate();
  
  const [utilityProviders, setUtilityProviders] = useState<UtilityProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<UtilityProvider | null>(null);

  const fetchUtilityData = async () => {
    if (!zipCode) {
      setError('Please enter a valid ZIP code first');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getUtilityData(zipCode);
      
      if (data.utilityInfo && data.utilityInfo.length > 0) {
        setUtilityProviders(data.utilityInfo);
        setElectricityRate(data.electricityRate);
        setBaseCost(data.baseCost);
      } else {
        throw new Error('No utility providers found for your area');
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      const errorMessage = err instanceof Error ? err.message : 'Unable to fetch utility providers';
      setError(errorMessage);
      setUtilityProviders([]);
    }
  };

  useEffect(() => {
    if (zipCode) {
      fetchUtilityData();
    }
  }, [zipCode]);

  const handleUtilitySelect = useCallback(async (provider: UtilityProvider) => {
    try {
      setUtilityProvider(provider.utility_name);
      setSelectedProvider(provider);
      
      // Calculate system size based on monthly bill and utility rates
      const requirements = calculateSystemRequirements(monthlyBill, electricityRate, baseCost);
      setPanelCount(requirements.numPanels);
      setSystemSize(requirements.systemSizeKW);
      
      // Move directly to results page
      navigate('/results');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process utility selection';
      console.error('Error in handleUtilitySelect:', errorMessage);
      setError(errorMessage);
    }
  }, [monthlyBill, electricityRate, baseCost, setPanelCount, setSystemSize, setUtilityProvider, navigate]);

  const handleRetry = () => {
    fetchUtilityData();
  };

  if (!zipCode) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-600">Please enter your address first</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto p-6"
    >
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Select Your Utility Provider</h2>
      
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading utility information...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-600">{error}</p>
            </div>
            <button
              onClick={handleRetry}
              className="flex items-center px-3 py-1 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
            >
              <RefreshCcw className="h-4 w-4 text-red-600 mr-1" />
              <span className="text-red-600 text-sm">Retry</span>
            </button>
          </div>
        </div>
      )}

      {!loading && !error && utilityProviders.length > 0 && (
        <div className="space-y-4">
          {utilityProviders.map((provider) => (
            <button
              key={provider.company_id}
              onClick={() => handleUtilitySelect(provider)}
              className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-[#CF7128] hover:bg-[#CF7128]/5 transition-colors group"
            >
              <div className="flex items-center">
                <Zap className="h-6 w-6 text-[#CF7128] mr-3 group-hover:text-[#B86422]" />
                <div>
                  <span className="block text-lg font-medium text-gray-900 group-hover:text-[#CF7128]">
                    {provider.utility_name}
                  </span>
                  <span className="text-sm text-gray-500">
                    Electric Utility Provider
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
};