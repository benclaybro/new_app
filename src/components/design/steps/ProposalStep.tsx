import React from 'react';
import { motion } from 'framer-motion';
import { useDesignStore } from '../../../store/designStore';
import RoofMap from '../RoofMap';
import { MapWrapper } from '../../maps/MapWrapper';
import { PanelLayout } from '../PanelLayout';
import { CostSavings } from '../CostSavings';

export const ProposalStep: React.FC = () => {
  const { address } = useDesignStore();

  if (!address) {
    return (
      <div className="p-6">
        <p className="text-red-600">Please enter an address first.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-6xl mx-auto p-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Solar Design</h2>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <MapWrapper>
              <RoofMap address={address} />
            </MapWrapper>
          </div>
          <PanelLayout />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Financial Analysis</h2>
          <CostSavings />
        </div>
      </div>
    </motion.div>
  );
};