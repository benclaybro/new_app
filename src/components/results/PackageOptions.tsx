import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Battery, Zap } from 'lucide-react';
import { useDesignStore } from '../../store/designStore';

export const PackageOptions = () => {
  const { setBatteryCount, setPanelCount } = useDesignStore();

  const packages = [
    {
      name: "Essential Solar",
      icon: <Sun className="h-6 w-6 text-yellow-500" />,
      description: "Perfect for getting started with solar",
      panels: 12,
      batteries: 0,
    },
    {
      name: "Energy Independence",
      icon: <Battery className="h-6 w-6 text-purple-500" />,
      description: "Maximum savings with battery backup",
      panels: 20,
      batteries: 2,
    },
    {
      name: "Power Plus",
      icon: <Zap className="h-6 w-6 text-blue-500" />,
      description: "Optimal balance of production and storage",
      panels: 16,
      batteries: 1,
    },
  ];

  const selectPackage = (panels: number, batteries: number) => {
    setPanelCount(panels);
    setBatteryCount(batteries);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-lg shadow-md mt-6"
    >
      <h3 className="text-xl font-semibold mb-4">Recommended Packages</h3>
      <div className="grid gap-4">
        {packages.map((pkg, index) => (
          <button
            key={index}
            onClick={() => selectPackage(pkg.panels, pkg.batteries)}
            className="flex items-center p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
          >
            <div className="mr-4">{pkg.icon}</div>
            <div>
              <h4 className="font-medium">{pkg.name}</h4>
              <p className="text-sm text-gray-600">{pkg.description}</p>
              <p className="text-sm text-gray-500 mt-1">
                {pkg.panels} Panels {pkg.batteries > 0 && `• ${pkg.batteries} Batteries`}
              </p>
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
};