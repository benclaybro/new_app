import React from 'react';
import { BadgePercent, Wallet, Shield } from 'lucide-react';

export const BenefitsOverview = () => {
  return (
    <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
      <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-green-50 rounded-lg">
        <BadgePercent className="h-8 w-8 text-green-600" />
        <div>
          <h3 className="text-sm sm:text-base font-semibold text-green-800">30% ITC ⬇️ + 10-20% Depr. ⬆️</h3>
          <p className="text-xs sm:text-sm text-green-600">Maximum tax benefits for your investment</p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-blue-50 rounded-lg">
        <Wallet className="h-8 w-8 text-blue-600" />
        <div>
          <h3 className="text-sm sm:text-base font-semibold text-blue-800">Cash Back x3</h3>
          <p className="text-xs sm:text-sm text-blue-600">Triple savings through various incentives</p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-purple-50 rounded-lg">
        <Shield className="h-8 w-8 text-purple-600" />
        <div>
          <h3 className="text-sm sm:text-base font-semibold text-purple-800">No Breakage Rooftop Guarantee</h3>
          <p className="text-xs sm:text-sm text-purple-600">Complete protection for your investment</p>
        </div>
      </div>
    </div>
  );
};