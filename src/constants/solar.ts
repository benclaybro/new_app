export const PANEL_DIMENSIONS = {
  width: 1030, // mm
  height: 1840, // mm
  thickness: 32, // mm
  weight: 21.1, // kg
  power: 405, // watts (Mitrex 405W panel)
};

export const SYSTEM_COSTS = {
  cashPrice: 2.60, // $ per watt
  financedPrice: 3.50, // $ per watt
  financingAPR: 3.99,
  financingTerm: 25, // years
  batteryPrice: 10500, // Price per battery (13.5 kWh)
};

export const INCENTIVES = {
  federal: 30, // 30% ITC for both solar and batteries
  depreciation: {
    enabled: true,
    rate: 85, // 85% of system cost can be depreciated
    taxRate: 0.21, // 21% corporate tax rate
    years: 5, // MACRS 5-year depreciation schedule
    schedule: [0.20, 0.32, 0.192, 0.115, 0.115, 0.058], // MACRS depreciation schedule
  },
  // State incentives will be populated based on location
};

export const PRODUCTION_FACTORS = {
  averageDailySunHours: 4.5,
  systemEfficiency: 0.80,
  monthlyFactors: [
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
  ]
};