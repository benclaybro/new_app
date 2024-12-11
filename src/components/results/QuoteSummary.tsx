import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Calendar, Shield, Minus, Plus, PanelTop, Battery, TrendingUp, ToggleLeft, ToggleRight } from 'lucide-react';
import { useDesignStore } from '../../store/designStore';
import { ContactModal } from '../ui/ContactModal';
import { SYSTEM_COSTS, PANEL_DIMENSIONS, INCENTIVES } from '../../constants/solar';
import { calculateDepreciation } from '../../utils/calculations';

type PaymentOption = 'cash' | 'finance';

export const QuoteSummary: React.FC = () => {
  const { panelCount, setPanelCount, batteryCount, setBatteryCount, monthlyBill, incentives, setIncentives } = useDesignStore();
  const [selectedOption, setSelectedOption] = useState<PaymentOption>('finance');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const handleContactSubmit = (data: { name: string; email: string; phone: string }) => {
    console.log('Contact form submitted:', data);
    // Here you would typically send this data to your backend
    setIsContactModalOpen(false);
  };

  // Calculate system costs
  const systemSizeWatts = panelCount * PANEL_DIMENSIONS.power;
  const batteryCost = batteryCount * SYSTEM_COSTS.batteryPrice;
  const cashSolarCost = systemSizeWatts * SYSTEM_COSTS.cashPrice;
  const totalCashCost = cashSolarCost + batteryCost;

  // Calculate incentives
  const federalCredit = incentives.itcEnabled ? totalCashCost * (INCENTIVES.federal / 100) : 0;
  const depreciation = calculateDepreciation(totalCashCost);
  const depreciationSavings = incentives.depreciationEnabled ? depreciation.total : 0;

  const totalIncentives = federalCredit + depreciation.total;
  const netCashCost = totalCashCost - federalCredit - depreciationSavings;

  // For financed amount, we apply the federal tax credit to reduce principal,
  // but depreciation benefits come later and don't reduce the loan amount
  const financedAmount = totalCashCost - 
    (incentives.itcEnabled ? federalCredit : 0) - 
    (incentives.depreciationEnabled ? depreciationSavings : 0);
  
  const toggleIncentive = (type: 'itc' | 'depreciation') => {
    setIncentives({
      ...incentives,
      [type === 'itc' ? 'itcEnabled' : 'depreciationEnabled']: !incentives[type === 'itc' ? 'itcEnabled' : 'depreciationEnabled']
    });
  };

  // Calculate monthly payment
  const monthlyRate = SYSTEM_COSTS.financingAPR / 100 / 12;
  const numPayments = SYSTEM_COSTS.financingTerm * 12;
  const monthlyPayment = (financedAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
                        (Math.pow(1 + monthlyRate, numPayments) - 1);

  // Calculate 25-year savings
  const calculate25YearSavings = () => {
    let totalUtilityCost = 0;
    let currentBill = monthlyBill;
    
    // Calculate utility costs with 3% annual increase
    for (let year = 1; year <= 25; year++) {
      totalUtilityCost += currentBill * 12;
      currentBill *= 1.03;
    }

    // Calculate solar costs
    const totalSolarCost = selectedOption === 'cash'
      ? netCashCost
      : financedAmount;

    return totalUtilityCost - totalSolarCost;
  };

  const totalSavings = calculate25YearSavings();

  const handlePanelChange = (change: number) => {
    const newCount = Math.max(1, Math.min(100, panelCount + change));
    setPanelCount(newCount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-4 sm:p-6 rounded-lg shadow-md"
    >
      <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Quote Summary</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <button
          onClick={() => setSelectedOption('cash')}
          className={`p-4 rounded-lg transition-colors ${
            selectedOption === 'cash' 
              ? 'bg-[#CF7128]/10 ring-2 ring-[#CF7128]' 
              : 'bg-gray-50 hover:bg-[#CF7128]/5'
          }`}
        >
          <DollarSign className="h-6 w-6 text-[#CF7128] mb-2" />
          <div className="text-sm text-gray-600">Cash Price</div>
          <div className="text-2xl font-bold">${Math.round(netCashCost).toLocaleString()}</div>
          <div className="text-sm text-gray-500">After federal tax credit</div>
        </button>
        <button
          onClick={() => setSelectedOption('finance')}
          className={`p-4 rounded-lg transition-colors ${
            selectedOption === 'finance' 
              ? 'bg-[#CF7128]/10 ring-2 ring-[#CF7128]' 
              : 'bg-gray-50 hover:bg-[#CF7128]/5'
          }`}
        >
          <Calendar className="h-6 w-6 text-[#CF7128] mb-2" />
          <div className="text-sm text-gray-600">Monthly Payment</div>
          <div className="text-2xl font-bold">${Math.round(monthlyPayment)}</div>
          <div className="text-sm text-gray-500">{SYSTEM_COSTS.financingTerm} years @ {SYSTEM_COSTS.financingAPR}% APR</div>
        </button>
      </div>

      <div className="border-t border-b py-6 mb-6 space-y-6">
        <h4 className="font-medium">Customize Your System</h4>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <PanelTop className="h-6 w-6 text-[#CF7128] mr-3" />
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

      <div className="bg-green-50 p-4 rounded-lg mb-6">
        <div className="flex items-center mb-2">
          <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
          <h4 className="font-medium text-green-800">Estimated 25-Year Savings</h4>
        </div>
        <p className="text-2xl font-bold text-green-700">
          ${Math.round(totalSavings).toLocaleString()}
        </p>
        <p className="text-sm text-green-600">
          Based on 3% annual utility rate increase
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="font-medium mb-4">System Cost</h4>
          <div className="bg-white border rounded-lg p-4">
            <div className="font-medium">Total Solar System Cost</div>
            <div className="text-2xl font-bold">${Math.round(totalCashCost).toLocaleString()}</div>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">System Details</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• {panelCount}x Premium {PANEL_DIMENSIONS.power}W Panels</li>
            <li>• {(systemSizeWatts / 1000).toFixed(1)} kW System Size</li>
            {batteryCount > 0 && <li>• {batteryCount}x 13.5 kWh Battery Storage</li>}
            <li>• Professional Installation Included</li>
          </ul>
        </div>

        <div>
          <h4 className="font-medium mb-4">Available Incentives</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white border rounded-lg">
              <div>
                <div className="font-medium">Investment Tax Credit (ITC)</div>
                <div className="text-2xl font-bold">${Math.round(federalCredit).toLocaleString()}</div>
              </div>
              <button
                onClick={() => toggleIncentive('itc')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                {incentives.itcEnabled ? (
                  <ToggleRight className="w-8 h-8 text-green-500" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-gray-400" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-white border rounded-lg">
              <div>
                <div className="font-medium">Depreciation Deduction</div>
                <div className="text-2xl font-bold">${Math.round(depreciationSavings).toLocaleString()}</div>
              </div>
              <button
                onClick={() => toggleIncentive('depreciation')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                {incentives.depreciationEnabled ? (
                  <ToggleRight className="w-8 h-8 text-green-500" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-gray-400" />
                )}
              </button>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h5 className="font-medium text-yellow-800 mb-2">Total Incentives</h5>
              <div className="text-3xl font-bold text-yellow-900">
                ${Math.round(federalCredit + depreciationSavings).toLocaleString()}
              </div>
            </div>
            
            <div className="bg-white border rounded-lg p-4">
              <div className="font-medium">Estimated Net Solar Cost</div>
              <div className="text-2xl font-bold text-blue-600">
                ${Math.round(netCashCost).toLocaleString()}
              </div>
              <p className="text-sm text-gray-500 mt-1">After all applicable incentives</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Warranty & Protection</h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Shield className="h-5 w-5 text-[#CF7128] mr-2" />
              <span className="font-medium">Complete Coverage</span>
            </div>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• 25-Year Panel Performance Warranty</li>
              <li>• 25-Year Equipment Warranty</li>
              <li>• 10-Year Workmanship Warranty</li>
              <li>• 24/7 System Monitoring</li>
            </ul>
          </div>
        </div>

        <div>
          <button 
            onClick={() => setIsContactModalOpen(true)}
            className="w-full bg-[#CF7128] text-white py-3 rounded-lg font-medium hover:bg-[#B86422] transition-colors"
          >
            Complete My Free Solar Design & Report
          </button>
          <p className="text-xs text-gray-500 mt-2 text-center">
            * This is an estimate and not a final quote
          </p>
        </div>
      </div>
      
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        onSubmit={handleContactSubmit}
      />
    </motion.div>
  );
};