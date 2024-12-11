import React from 'react';
import { motion } from 'framer-motion';
import { useDesignStore } from '../../../store/designStore';
import { calculateSystemRequirements } from '../../../utils/calculations';

export const UsageStep: React.FC = () => {
  const { 
    monthlyBill, 
    setMonthlyBill, 
    setCurrentStep,
    electricityRate,
    baseCost,
    setPanelCount 
  } = useDesignStore();

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBill = Number(e.target.value);
    setMonthlyBill(newBill);
    
    // Calculate required system size and update panel count
    const requirements = calculateSystemRequirements(newBill, electricityRate, baseCost);
    setPanelCount(requirements.numPanels);
  };

  const handleContinue = () => {
    setCurrentStep('utility');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto p-6"
    >
      <h2 className="text-3xl font-bold text-gray-900 mb-6">What's Your Average Monthly Power Bill?</h2>
      
      <div className="space-y-6">
        <div>
          <input
            type="range"
            min="50"
            max="500"
            step="10"
            value={monthlyBill}
            onChange={handleSliderChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#CF7128]"
          />
          
          <div className="mt-4 text-center">
            <span className="text-4xl font-bold text-[#CF7128]">${monthlyBill}</span>
            <span className="text-gray-600 ml-2">per month</span>
          </div>
        </div>

        <button
          onClick={handleContinue}
          className="w-full py-3 px-4 bg-[#CF7128] text-white rounded-lg hover:bg-[#B86422] transition-colors font-medium"
        >
          Continue
        </button>
      </div>
    </motion.div>
  );
};