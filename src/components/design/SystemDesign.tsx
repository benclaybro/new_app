import React from 'react';
import { useDesignStore } from '../../store/designStore';
import { PANEL_DIMENSIONS, PRODUCTION_FACTORS } from '../../constants/solar';
import { Minus, Plus } from 'lucide-react';

export const SystemDesign: React.FC = () => {
  const {
    panelCount,
    setPanelCount,
    monthlyBill,
    batteryCount,
    setBatteryCount
  } = useDesignStore();

  const systemSizeKW = (panelCount * PANEL_DIMENSIONS.power) / 1000;
  const annualProduction = Math.round(
    systemSizeKW * 
    PRODUCTION_FACTORS.averageDailySunHours * 
    PRODUCTION_FACTORS.systemEfficiency * 
    365
  );

  const handlePanelChange = (change: number) => {
    const newCount = Math.max(1, Math.min(100, panelCount + change));
    setPanelCount(newCount);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{systemSizeKW.toFixed(2)} kW</h2>
          <p className="text-gray-600">System size</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-gray-900">{annualProduction.toLocaleString()} kWh</h2>
          <p className="text-gray-600">Est. Annual Production</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Monthly Electric Bill
          </label>
          <div className="text-2xl font-bold text-gray-900">
            ${monthlyBill}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Solar Panels
          </label>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handlePanelChange(-1)}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
            >
              <Minus className="h-5 w-5" />
            </button>
            <span className="text-2xl font-bold w-16 text-center">{panelCount}</span>
            <button
              onClick={() => handlePanelChange(1)}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Battery
          </label>
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
            <span>Add battery storage for backup power</span>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setBatteryCount(Math.max(0, batteryCount - 1))}
                className="p-2 rounded-full bg-white hover:bg-gray-100"
              >
                <Minus className="h-5 w-5" />
              </button>
              <span className="text-xl font-bold w-12 text-center">{batteryCount}</span>
              <button
                onClick={() => setBatteryCount(batteryCount + 1)}
                className="p-2 rounded-full bg-white hover:bg-gray-100"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};