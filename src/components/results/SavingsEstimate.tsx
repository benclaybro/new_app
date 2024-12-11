import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { useDesignStore } from '../../store/designStore';
import { calculateSavings, calculateSolarCost } from '../../utils/calculations';

export const SavingsEstimate = () => {
  const { monthlyBill, electricityRate, baseCost, panelCount } = useDesignStore();
  const systemSizeKW = (panelCount * 0.4); // 400W panels = 0.4kW each
  
  // Calculate savings over 25 years
  const savings = calculateSavings(monthlyBill, baseCost, electricityRate, systemSizeKW);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-green-50 p-4 sm:p-6 rounded-lg mb-6"
    >
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="h-5 w-5 text-green-600" />
        <h3 className="text-lg font-medium text-green-800">Estimated 25-Year Savings</h3>
      </div>
      <div className="text-3xl font-bold text-green-700 mb-1">
        ${Math.round(savings.totalSavings).toLocaleString()}
      </div>
      <p className="text-sm text-green-600">
        Based on 6% annual utility rate increase
      </p>
    </motion.div>
  );
};