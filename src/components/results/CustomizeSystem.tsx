import React from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, PanelTop, Battery } from 'lucide-react';
import { useDesignStore } from '../../store/designStore';

export const CustomizeSystem = () => {
  const { panelCount, setPanelCount, batteryCount, setBatteryCount } = useDesignStore();

  const handlePanelChange = (change: number) => {
    const newCount = Math.max(1, Math.min(100, panelCount + change));
    setPanelCount(newCount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-lg shadow-md mt-6"
    >
      <h3 className="text-xl font-semibold mb-4">Customize Your System</h3>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <PanelTop className="h-6 w-6 text-blue-500 mr-3" />
            <div>
              <h4 className="font-medium">Solar Panels</h4>
              <p className="text-sm text-gray-600">Premium 400W Panels</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handlePanelChange(-1)}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
            >
              <Minus className="h-5 w-5" />
            </button>
            <span className="text-xl font-bold w-12 text-center">{panelCount}</span>
            <button
              onClick={() => handlePanelChange(1)}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Battery className="h-6 w-6 text-purple-500 mr-3" />
            <div>
              <h4 className="font-medium">Battery Storage</h4>
              <p className="text-sm text-gray-600">13.5 kWh per unit</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setBatteryCount(Math.max(0, batteryCount - 1))}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
            >
              <Minus className="h-5 w-5" />
            </button>
            <span className="text-xl font-bold w-12 text-center">{batteryCount}</span>
            <button
              onClick={() => setBatteryCount(batteryCount + 1)}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};