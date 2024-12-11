import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DesignTool } from '../components/design/DesignTool';
import { useDesignStore } from '../store/designStore';

export const DesignPage = () => {
  const navigate = useNavigate();
  const { currentStep, setCurrentStep } = useDesignStore();

  React.useEffect(() => {
    // Reset to first step when entering design page
    setCurrentStep('address');
  }, [setCurrentStep]);

  React.useEffect(() => {
    // Navigate to results when design is complete
    if (currentStep === 'design') {
      navigate('/results');
    }
  }, [currentStep, navigate]);

  return <DesignTool />;
};