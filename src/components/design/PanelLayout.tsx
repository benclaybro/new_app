import React from 'react';
import { motion } from 'framer-motion';
import { Battery, PanelTop } from 'lucide-react';
import { useDesignStore } from '../../store/designStore';
import { calculateSystemRequirements, calculateProduction } from '../../utils/calculations';

export const PanelLayout = () => {
  const {
    monthlyBill,
    electricityRate,
    baseCost,
    batteryCount,
    setBatteryCount,
    panelCount,
    setPanelCount
  } = useDesignStore();

  // Calculate system requirements
  const requirements = calculateSystemRequirements(monthlyBill, electricityRate, baseCost);
  
  // Calculate production estimates
  const production = calculateProduction(requirements.systemSizeKW);

  // Handler for panel count changes
  const handlePanelChange = (change: number) => {
    const newCount = Math.max(1, panelCount + change);
    setPanelCount(newCount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-lg shadow-md mt-4"
    >
      <h3 className="text-xl font-semibold mb-4">System Design</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <PanelTop className="h-6 w-6 text-blue-500 mb-2" />
              <h4 className="font-medium">Solar Panels</h4>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePanelChange(-1)}
                className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200"
              >
                -
              </button>
              <span className="text-2xl font-bold w-16 text-center">{panelCount}</span>
              <button
                onClick={() => handlePanelChange(1)}
                className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200"
              >
                +
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Battery className="h-6 w-6 text-green-500 mb-2" />
              <h4 className="font-medium">Battery Storage</h4>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setBatteryCount(Math.max(0, batteryCount - 1))}
                className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200"
              >
                -
              </button>
              <span className="text-2xl font-bold w-16 text-center">{batteryCount}</span>
              <button
                onClick={() => setBatteryCount(batteryCount + 1)}
                className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">System Specifications</h4>
          <ul className="space-y-2 text-sm">
            <li>Panel Type: Premium 400W Monocrystalline</li>
            <li>Total System Size: {(panelCount * 0.4).toFixed(1)} kW</li>
            <li>Battery Capacity: {batteryCount * 13.5} kWh</li>
            <li>Estimated Daily Production: {(panelCount * 0.4 * 4.5 * 0.8).toFixed(1)} kWh</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
};