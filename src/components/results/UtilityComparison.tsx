import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useDesignStore } from '../../store/designStore';

export const UtilityComparison = () => {
  const { monthlyBill, utilityProvider } = useDesignStore();

  const generateChartData = () => {
    const data = [];
    let currentBill = monthlyBill;
    
    for (let year = 0; year <= 25; year++) {
      data.push({
        year,
        bill: Math.round(currentBill)
      });
      currentBill *= 1.06; // 6% annual increase
    }
    
    return data;
  };

  const calculateTotalCost = () => {
    let totalCost = 0;
    let currentBill = monthlyBill;
    for (let year = 1; year <= 25; year++) {
      totalCost += currentBill * 12;
      currentBill *= 1.06; // 6% annual increase
    }
    return totalCost;
  };

  const chartData = generateChartData();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-3 sm:p-6 rounded-xl shadow-lg"
    >
      <div className="flex items-start gap-2 sm:gap-3 mb-4 sm:mb-6">
        <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-red-600">
            {utilityProvider} over the next 25 years with 6% annual increases
          </h3>
        </div>
      </div>

      <div className="space-y-6">
        <div className="pt-4">
          <h4 className="font-medium mb-6 text-center">Your Rising Monthly Bills</h4>
          <div className="h-[250px] sm:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={chartData} 
                margin={{ 
                  top: 10, 
                  right: 5, 
                  left: 0, 
                  bottom: 20 
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="year" 
                  tick={{ fontSize: 10 }}
                  tickMargin={8}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  width={50}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  wrapperStyle={{ fontSize: 12 }}
                  formatter={(value) => [`$${value}`, 'Monthly Bill']}
                  labelFormatter={(label) => `Year ${label}`}
                  contentStyle={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    padding: '8px 12px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="bill"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <CostComparison />
      </div>
    </motion.div>
  );
};

import { CostComparison } from './CostComparison';