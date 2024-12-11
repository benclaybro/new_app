import React from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingUp } from 'lucide-react';
import { useDesignStore } from '../../store/designStore';

export const CostComparison = () => {
  const { monthlyBill } = useDesignStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-6 pb-10"
    >
      <h3 className="text-lg sm:text-xl font-semibold mb-4">Your Energy Options</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="p-4 rounded-lg bg-gray-100">
          <div className="flex items-center mb-3">
            <Zap className="h-5 w-5 text-gray-500 mr-2" />
            <h4 className="font-medium">Traditional Power</h4>
          </div>
          <div className="space-y-2">
            <p className="text-xl sm:text-2xl font-bold text-gray-900">
              ${monthlyBill}/month
            </p>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• 3% annual rate increase</p>
              <p>• No ownership benefits</p>
              <p>• Subject to utility changes</p>
              <p>• Continuous monthly bills</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-blue-50">
          <div className="flex items-center mb-3">
            <TrendingUp className="h-5 w-5 text-[#CF7128] mr-2" />
            <h4 className="font-medium">Solar Power</h4>
          </div>
          <div className="space-y-2">
            <p className="text-xl sm:text-2xl font-bold text-[#CF7128]">
              $0 Down
            </p>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• Fixed payments</p>
              <p>• System ownership</p>
              <p>• 25-year warranty</p>
              <p>• Energy independence</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};