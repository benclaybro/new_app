import React from 'react';
import { motion } from 'framer-motion';
import { useDesignStore } from '../../store/designStore';
import { MapWrapper } from '../maps/MapWrapper';
import RoofMap from './RoofMap';
import { SystemDesign } from './SystemDesign';
import { QuoteSummary } from './QuoteSummary';
import { PackageOptions } from './PackageOptions';
import { Customize } from './Customize';

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
      className="max-w-7xl mx-auto p-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
            <MapWrapper>
              <RoofMap address={address} />
            </MapWrapper>
          </div>
          <PackageOptions />
          <Customize />
        </div>

        <div className="space-y-6">
          <SystemDesign />
          <QuoteSummary />
        </div>
      </div>
    </motion.div>
  );
};