import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { createLead } from '../utils/leads';
import RoofMap from '../components/design/RoofMap';
import { SystemOverview } from '../components/results/SystemOverview';
import { CustomizeSystem } from '../components/results/CustomizeSystem';
import { UtilityComparison } from '../components/results/UtilityComparison';
import { SavingsEstimate } from '../components/results/SavingsEstimate';
import { BenefitsOverview } from '../components/results/BenefitsOverview';
import { ProposalCTA } from '../components/results/ProposalCTA';
import { useDesignStore } from '../store/designStore';
import { useAuthStore } from '../store/authStore';
import { calculateSavings } from '../utils/calculations';

export const ResultsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [validationComplete, setValidationComplete] = useState(false);
  const [leadCreated, setLeadCreated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { 
    address, 
    utilityProvider, 
    monthlyBill,
    baseCost,
    electricityRate,
    panelCount,
    systemSize
  } = useDesignStore();

  const createNewLead = useCallback(async () => {
    if (!profile?.id || !address || leadCreated || !validationComplete) return;
    
    // Check if we're coming from lead details page
    const { leadId } = location.state || {};
    if (leadId) {
      return; // Don't create new lead if we're viewing an existing one
    }
    
    // Validate all required data is present
    if (!monthlyBill || !utilityProvider || !systemSize || !panelCount) {
      console.warn('Missing required lead data');
      setError('Missing required information for solar calculation');
      setTimeout(() => {
        navigate('/design', { replace: true });
      }, 1500);
      return;
    }
    
    try {
      const leadData = {
        name: 'New Lead',
        address,
        contact_info: {
          utility: utilityProvider,
          monthly_bill: monthlyBill,
          system_size: systemSize,
          panel_count: panelCount
        },
        status: 'new',
        assigned_to: profile.id,
        notes: `Monthly Bill: $${monthlyBill}\nSystem Size: ${systemSize.toFixed(1)}kW\nPanel Count: ${panelCount}\nUtility: ${utilityProvider}`
      };

      await createLead(leadData);
      setLeadCreated(true);
    } catch (error) {
      console.error('Error creating lead:', error);
      setError('Failed to create lead. Please try again.');
    }
  }, [address, monthlyBill, panelCount, profile?.id, systemSize, utilityProvider, leadCreated, validationComplete, location.state]);

  useEffect(() => {
    setIsLoading(true);
    const { leadId } = location.state || {};
    const requiredFields = [address, monthlyBill, utilityProvider, systemSize, panelCount];
    
    // If coming from lead details page with a leadId, we already have the data
    if (leadId) {
      setValidationComplete(true);
      setIsLoading(false);
      return;
    }

    // For new calculations, validate all required data
    if (!address || !profile) {
      setIsLoading(false);
      navigate('/design');
      return;
    }

    if (requiredFields.some(field => !field)) {
      setError('Missing required information for solar calculation');
      setTimeout(() => {
        setIsLoading(false);
        navigate('/design', { replace: true });
      }, 1500);
      return;
    }

    setValidationComplete(true);
    setIsLoading(false);
  }, [address, profile, navigate, utilityProvider, monthlyBill, systemSize, panelCount, location.state]);

  // Create lead after validation is complete
  useEffect(() => {
    if (validationComplete && !leadCreated) {
      createNewLead();
    }
  }, [validationComplete, leadCreated, createNewLead]);

  if (isLoading || !validationComplete) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 pt-14 sm:pt-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
        {error && (
          <div className="col-span-full bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}
        
        <div className="space-y-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 px-1">Your Solar Report</h2>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <RoofMap address={address} />
          </div>
          <SystemOverview />
          <CustomizeSystem />
          <SavingsEstimate />
          <p className="text-base sm:text-lg text-gray-700 mb-6 px-1">
            Avoid losing ${Math.round(calculateSavings(monthlyBill, baseCost, electricityRate, panelCount * 0.4).totalSavings).toLocaleString()} to your utility. With NO upfront cost or installation fees, you can OWN your fixed solar solution that powers your future.
          </p>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              Cost of Staying with the Utility
            </h2>
            <UtilityComparison />
            <BenefitsOverview />
            <ProposalCTA />
          </div>
        </div>
      </div>
    </div>
  );
};