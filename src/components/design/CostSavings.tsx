import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingDown, Sun, Battery } from 'lucide-react';
import { useDesignStore } from '../../store/designStore';
import { calculateSystemRequirements, calculateCosts, calculateSavings, calculateProduction } from '../../utils/calculations';

export const CostSavings = () => {
  const {
    monthlyBill,
    electricityRate,
    systemSize,
    incentives,
    utilityProvider,
    baseCost,
    batteryCount
  } = useDesignStore();

  // Calculate system requirements
  const requirements = calculateSystemRequirements(monthlyBill, electricityRate, baseCost);

  // Calculate production estimates
  const production = calculateProduction(requirements.systemSizeKW);

  // Calculate costs including battery if selected
  const batteryCost = batteryCount * 10000; // $10,000 per battery
  const costs = calculateCosts({
    monthlyBill,
    electricityRate,
    systemSizeKW: requirements.systemSizeKW,
    incentives: {
      federal: 30, // 30% ITC
      state: incentives.state || 0,
      utility: incentives.utility || 0
    }
  });

  // Add battery costs
  costs.grossCost += batteryCost;
  costs.federalCredit = costs.grossCost * 0.30; // Battery eligible for 30% ITC
  costs.netCost = costs.grossCost - costs.federalCredit - costs.stateCredit - costs.utilityCredit;

  // Recalculate monthly payment with battery
  const monthlyRate = 0.0399 / 12;
  const numPayments = 25 * 12;
  costs.monthlyPayment = (costs.netCost * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
                        (Math.pow(1 + monthlyRate, numPayments) - 1);

  // Calculate savings
  const savings = calculateSavings(monthlyBill, costs.monthlyPayment, baseCost, electricityRate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-lg shadow-md mt-4"
    >
      <h3 className="text-xl font-semibold mb-4">System Overview & Savings</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <Sun className="h-6 w-6 text-blue-500 mb-2" />
          <h4 className="font-medium mb-1">System Size</h4>
          <p className="text-2xl font-bold">{requirements.systemSizeKW.toFixed(1)} kW</p>
          <div className="text-sm text-gray-600 space-y-1">
            <p>{requirements.numPanels} Premium 400W Panels</p>
            <p>{batteryCount} Battery Storage Units</p>
            <p>{Math.round(production.annualProduction).toLocaleString()} kWh/year</p>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <DollarSign className="h-6 w-6 text-green-500 mb-2" />
          <h4 className="font-medium mb-1">System Cost</h4>
          <p className="text-2xl font-bold">${Math.round(costs.netCost).toLocaleString()}</p>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Gross Cost: ${Math.round(costs.grossCost).toLocaleString()}</p>
            <p>Federal Tax Credit: ${Math.round(costs.federalCredit).toLocaleString()}</p>
            <p>${Math.round(costs.monthlyPayment)}/month</p>
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <TrendingDown className="h-6 w-6 text-yellow-500 mb-2" />
          <h4 className="font-medium mb-1">Monthly Savings</h4>
          <p className="text-2xl font-bold">${Math.round(savings.monthlyBillSavings).toLocaleString()}</p>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Current Bill: ${monthlyBill}/month</p>
            <p>New Payment: ${Math.round(costs.monthlyPayment)}/month</p>
            <p>Base Cost: ${baseCost}/month</p>
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <Battery className="h-6 w-6 text-purple-500 mb-2" />
          <h4 className="font-medium mb-1">25-Year Impact</h4>
          <p className="text-2xl font-bold">${Math.round(savings.totalSavings).toLocaleString()}</p>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Payback Period: {savings.paybackYears} years</p>
            <p>CO₂ Reduction: {Math.round(production.annualProduction * 0.0007)} tons/yr</p>
            <p>Warranty: 25 years</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">System Details</h4>
          <ul className="space-y-2 text-sm">
            <li>• Premium 400W Monocrystalline Panels ({requirements.numPanels})</li>
            <li>• Microinverters with Panel-Level Monitoring</li>
            <li>• {batteryCount > 0 ? `${batteryCount} x 13.5 kWh Battery Storage` : 'No Battery Storage'}</li>
            <li>• Complete Installation & Permitting</li>
            <li>• 25-Year Equipment & Production Warranty</li>
            <li>• 24/7 System Monitoring</li>
          </ul>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Financial Benefits</h4>
          <ul className="space-y-2 text-sm">
            <li>• Monthly Savings: ${Math.round(savings.monthlyBillSavings)}</li>
            <li>• Federal Tax Credit (30%): ${Math.round(costs.federalCredit).toLocaleString()}</li>
            <li>• Loan Terms: 25 years @ 3.99% APR</li>
            <li>• Protection from {utilityProvider} Rate Increases</li>
            <li>• Property Value Increase: ~4%</li>
            <li>• ROI: {Math.round((savings.totalSavings / costs.netCost) * 100)}%</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
};