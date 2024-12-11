import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AddressStep } from './steps/AddressStep';
import { UsageStep } from './steps/UsageStep';
import { UtilityStep } from './steps/UtilityStep';
import { ProposalStep } from './steps/ProposalStep';
import { useDesignStore } from '../../store/designStore';
import type { DesignStep } from '../../store/designStore';

const stepComponents: Record<DesignStep, React.FC> = {
  'address': AddressStep,
  'usage': UsageStep,
  'utility': UtilityStep,
  'design': ProposalStep,
};

export const DesignTool: React.FC = () => {
  const { currentStep } = useDesignStore();
  const CurrentStepComponent = stepComponents[currentStep];

  if (!CurrentStepComponent) {
    return <div>Invalid step</div>;
  }

  return (
    <div id="design-tool" className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-lg"
          >
            <CurrentStepComponent />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};