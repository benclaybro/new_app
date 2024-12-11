import React from 'react';
import { useDesignStore } from '../../store/designStore';
import { SYSTEM_COSTS, PANEL_DIMENSIONS, INCENTIVES } from '../../constants/solar';

export const QuoteSummary: React.FC = () => {
  const { panelCount, batteryCount } = useDesignStore();

  // Calculate system costs
  const systemSizeWatts = panelCount * PANEL_DIMENSIONS.power;
  const batteryCost = batteryCount * SYSTEM_COSTS.batteryPrice;

  // Calculate cash price
  const solarCashCost = systemSizeWatts * SYSTEM_COSTS.cashPrice;
  const totalCashCost = solarCashCost + batteryCost;

  // Calculate financed price
  const solarFinancedCost = systemSizeWatts * SYSTEM_COSTS.financedPrice;
  const totalFinancedCost = solarFinancedCost + batteryCost;

  // Calculate incentives
  const federalCredit = totalCashCost * (INCENTIVES.federal / 100);

  // Calculate monthly payment
  const monthlyRate = SYSTEM_COSTS.financingAPR / 100 / 12;
  const numPayments = SYSTEM_COSTS.financingTerm * 12;
  const monthlyPayment = (totalFinancedCost * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
                        (Math.pow(1 + monthlyRate, numPayments) - 1);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-xl font-bold mb-6">Quote Summary</h3>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 border rounded-lg text-center cursor-pointer hover:border-blue-500">
          <div className="text-sm text-gray-600 mb-1">CASH</div>
          <div className="text-2xl font-bold">${Math.round(totalCashCost).toLocaleString()}</div>
        </div>
        <div className="p-4 border rounded-lg text-center cursor-pointer hover:border-blue-500">
          <div className="text-sm text-gray-600 mb-1">FINANCING</div>
          <div className="text-2xl font-bold">${Math.round(monthlyPayment)}/mo</div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="font-medium mb-2">Equipment</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• {panelCount}x Mitrex {PANEL_DIMENSIONS.power}W Solar Panels</li>
            <li>• Premium Inverter System</li>
            {batteryCount > 0 && (
              <li>• {batteryCount}x 13.5 kWh Battery Storage</li>
            )}
          </ul>
        </div>

        <div>
          <h4 className="font-medium mb-2">Warranty & Service</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• 25 year equipment warranty</li>
            <li>• 10 year workmanship warranty</li>
            <li>• 24/7 monitoring & support</li>
            <li>• Professional installation</li>
          </ul>
        </div>

        <div>
          <h4 className="font-medium mb-2">Federal & State Incentives</h4>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-lg font-bold text-green-700">
              ${Math.round(federalCredit).toLocaleString()}
            </div>
            <p className="text-sm text-green-600">
              30% Federal Tax Credit
            </p>
          </div>
        </div>

        <div className="pt-4 border-t">
          <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700">
            Proceed with Quote
          </button>
        </div>
      </div>
    </div>
  );
};