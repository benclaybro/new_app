import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Battery, Zap } from 'lucide-react';
import { useDesignStore } from '../../store/designStore';
import { PANEL_DIMENSIONS, PRODUCTION_FACTORS } from '../../constants/solar';

export const SystemOverview = () => {
  const { panelCount, batteryCount, monthlyBill, electricityRate } = useDesignStore();
  const systemSizeKW = (panelCount * PANEL_DIMENSIONS.power) / 1000;

  // Calculate annual production
  const dailyProduction = systemSizeKW * PRODUCTION_FACTORS.averageDailySunHours * PRODUCTION_FACTORS.systemEfficiency;
  const annualProduction = dailyProduction * 365;
  
  // Calculate annual usage from monthly bill
  const monthlyUsageKWh = (monthlyBill / electricityRate);
  const annualUsageKWh = monthlyUsageKWh * 12;
  
  // Calculate offset percentage without capping at 100%
  const offsetPercentage = Math.round((annualProduction / annualUsageKWh) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-3 sm:p-6 rounded-lg shadow-md"
    >
      <h3 className="text-lg sm:text-xl font-semibold mb-4">System Overview</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6">
        <div className="bg-[#CF7128]/5 p-3 sm:p-4 rounded-lg">
          <Sun className="h-6 w-6 text-[#CF7128] mb-2" />
          <h4 className="font-medium mb-1">Solar Array</h4>
          <div className="text-sm space-y-1">
            <p className="text-2xl font-bold">{systemSizeKW.toFixed(1)} kW</p>
            <p>{panelCount} Premium {PANEL_DIMENSIONS.power}W Panels</p>
            <p>Microinverter System</p>
          </div>
        </div>

        <div className="bg-[#CF7128]/5 p-3 sm:p-4 rounded-lg">
          <Zap className="h-6 w-6 text-[#CF7128] mb-2" />
          <h4 className="font-medium mb-1">Power Offset</h4>
          <div className="text-sm space-y-1">
            <p className="text-2xl font-bold">{offsetPercentage}%</p>
            <p>{Math.round(annualProduction).toLocaleString()} kWh/yr</p>
            <p>Production Estimate</p>
          </div>
        </div>

        <div className="bg-[#CF7128]/5 p-3 sm:p-4 rounded-lg">
          <Battery className="h-6 w-6 text-[#CF7128] mb-2" />
          <h4 className="font-medium mb-1">Battery Storage</h4>
          <div className="text-sm space-y-1">
            <p className="text-2xl font-bold">{batteryCount * 13.5} kWh</p>
            <p>{batteryCount} Battery Units</p>
            <p>Backup Power Ready</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};