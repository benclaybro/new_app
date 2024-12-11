import { PANEL_DIMENSIONS, SYSTEM_COSTS, INCENTIVES } from '../constants/solar';

export const calculateTotalUtilityCost = (monthlyBill: number) => {
  let totalCost = 0;
  let currentBill = monthlyBill;
  
  for (let year = 1; year <= 25; year++) {
    totalCost += currentBill * 12;
    currentBill *= 1.06; // 6% annual increase
  }
  
  return Math.round(totalCost);
};

export const calculateSolarCost = (systemSizeKW: number) => {
  // Calculate total system cost at $3.45/watt
  const totalCost = systemSizeKW * 1000 * 3.45;
  
  // Calculate monthly payment for 25-year loan at 3.99% APR
  const monthlyRate = 0.0399 / 12;
  const numPayments = 25 * 12;
  const monthlyPayment = (totalCost * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
                        (Math.pow(1 + monthlyRate, numPayments) - 1);
  
  // Calculate total cost over 25 years with financing
  const totalFinancedCost = monthlyPayment * numPayments;
  
  return {
    systemCost: totalCost,
    monthlyPayment,
    totalFinancedCost
  };
};

export const calculateDepreciation = (systemCost: number) => {
  if (!INCENTIVES.depreciation.enabled) return 0;
  
  // 85% of system cost can be depreciated using MACRS
  const depreciableAmount = systemCost * 0.85;
  
  // MACRS depreciation schedule
  const macrsSchedule = [0.20, 0.32, 0.192, 0.115, 0.115, 0.058];
  
  // Calculate yearly depreciation amounts
  const yearlyDepreciation = macrsSchedule.map(rate => 
    depreciableAmount * rate
  );
  
  // Calculate tax savings for each year (21% corporate tax rate)
  const yearlyTaxSavings = yearlyDepreciation.map(amount => 
    amount * 0.21
  );
  
  // Total tax savings from depreciation
  const totalTaxSavings = yearlyTaxSavings.reduce((sum, amount) => sum + amount, 0);
  
  return {
    total: totalTaxSavings,
    yearly: yearlyTaxSavings,
    depreciationSchedule: yearlyDepreciation
  };
};

interface SolarCalculationParams {
  monthlyBill: number;
  electricityRate: number;
  systemSizeKW: number;
  incentives: {
    federal: number;
    state: number;
    utility: number;
    itcEnabled: boolean;
    depreciationEnabled: boolean;
  };
}

export const calculateSystemRequirements = (
  monthlyBill: number, 
  electricityRate: number,
  baseCost: number = 0
) => {
  // Remove base cost from monthly bill to get true usage cost
  const usageCost = monthlyBill - baseCost;
  
  // Calculate annual usage in kWh
  const annualUsage = (usageCost * 12) / electricityRate;
  
  // Calculate required system size (kW) for 100% offset
  // Using standard 4.5 peak sun hours and 80% system efficiency
  // Daily production needs to match daily usage
  const dailyUsage = annualUsage / 365;
  const systemSizeKW = dailyUsage / (4.5 * 0.80);
  
  // Calculate number of panels needed
  // Each panel is 400W = 0.4kW
  const numPanels = Math.ceil((systemSizeKW * 1000) / PANEL_DIMENSIONS.power);
  
  return {
    annualUsage,
    systemSizeKW,
    numPanels,
    dailyUsage: annualUsage / 365,
    monthlyUsage: annualUsage / 12
  };
};

export const calculateCosts = ({
  monthlyBill,
  electricityRate,
  systemSizeKW,
  incentives
}: SolarCalculationParams) => {
  // Calculate gross system cost
  // Using $3.00/watt as the base cost for premium equipment and installation
  const costPerWatt = 3.00;
  const grossCost = systemSizeKW * 1000 * costPerWatt;
  
  // Calculate incentives
  const federalCredit = grossCost * (incentives.federal / 100);
  const stateCredit = grossCost * (incentives.state / 100);
  const utilityCredit = grossCost * (incentives.utility / 100);
  
  // Calculate net cost after incentives
  const netCost = grossCost - federalCredit - stateCredit - utilityCredit;
  
  // Calculate monthly payment
  // 25-year loan at 3.99% APR
  const monthlyRate = 0.0399 / 12;
  const numPayments = 25 * 12;
  const monthlyPayment = (netCost * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
                        (Math.pow(1 + monthlyRate, numPayments) - 1);
  
  return {
    grossCost,
    netCost,
    federalCredit,
    stateCredit,
    utilityCredit,
    monthlyPayment,
    costPerWatt
  };
};

export const calculateSavings = (
  monthlyBill: number, 
  baseCost: number = 0,
  electricityRate: number,
  systemSizeKW: number
) => {
  // Calculate utility costs with 6% annual increase
  let totalUtilityCost = 0;
  let currentBill = monthlyBill;
  const yearByYearSavings = [];
  
  // Calculate solar costs
  const solarCosts = calculateSolarCost(systemSizeKW);
  
  for (let year = 1; year <= 25; year++) {
    const annualUtilityCost = currentBill * 12;
    const annualSolarCost = solarCosts.monthlyPayment * 12;
    
    totalUtilityCost += annualUtilityCost;
    
    yearByYearSavings.push({
      year,
      utilityCost: annualUtilityCost,
      solarCost: annualSolarCost,
      savings: annualUtilityCost - annualSolarCost
    });
    
    currentBill *= 1.06; // 6% annual increase
  }
  
  // Calculate total savings by subtracting total solar cost from utility cost
  const netSavings = totalUtilityCost - solarCosts.totalFinancedCost;
  
  return {
    totalSavings: netSavings,
    yearByYearSavings,
    monthlyPayment: solarCosts.monthlyPayment,
    utilityTotal: totalUtilityCost,
    solarTotal: solarCosts.totalFinancedCost
  };
};

export const calculateProduction = (systemSizeKW: number) => {
  // Calculate monthly production based on seasonal variations
  // Using typical production factors for each month (1.0 = average)
  const monthlyFactors = [
    0.75, // January
    0.85, // February
    1.00, // March
    1.15, // April
    1.25, // May
    1.30, // June
    1.30, // July
    1.25, // August
    1.15, // September
    1.00, // October
    0.80, // November
    0.70  // December
  ];
  
  // Base daily production: systemSize * 4.5 peak sun hours * 80% efficiency
  const baseDailyProduction = systemSizeKW * 4.5 * 0.80;
  
  const monthlyProduction = monthlyFactors.map(factor => {
    return Math.round(baseDailyProduction * factor * 30.44); // Average days per month
  });
  
  const annualProduction = monthlyProduction.reduce((sum, prod) => sum + prod, 0);
  
  return {
    monthlyProduction,
    annualProduction,
    dailyAverage: annualProduction / 365,
    monthlyAverage: annualProduction / 12
  };
};