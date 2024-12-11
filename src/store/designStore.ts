import { create, StateCreator } from 'zustand';

export type DesignStep = 'address' | 'usage' | 'utility' | 'design';

interface RoofSegment {
  area: number;
  azimuth?: number;
  pitch?: number;
  center?: {
    latitude: number;
    longitude: number;
  };
  boundingBox: {
    sw: {
      latitude: number;
      longitude: number;
    };
    ne: {
      latitude: number;
      longitude: number;
    };
  };
}

interface DesignState {
  // Navigation
  currentStep: DesignStep;
  setCurrentStep: (step: DesignStep) => void;

  // Address Information
  address: string;
  setAddress: (address: string) => void;
  zipCode: string;
  setZipCode: (zipCode: string) => void;

  // Usage & Utility
  monthlyBill: number;
  setMonthlyBill: (amount: number) => void;
  utilityProvider: string;
  setUtilityProvider: (provider: string) => void;
  electricityRate: number;
  setElectricityRate: (rate: number) => void;
  baseCost: number;
  setBaseCost: (cost: number) => void;

  // System Design
  systemSize: number;
  setSystemSize: (size: number) => void;
  panelCount: number;  // Will be calculated based on usage
  setPanelCount: (count: number) => void;
  batteryCount: number;
  setBatteryCount: (count: number) => void;
  
  // Incentives
  incentives: {
    federal: number;
    state: number;
    utility: number;
    itcEnabled: boolean;
    depreciationEnabled: boolean;
  };
  setIncentives: (incentives: { federal: number; state: number; utility: number; itcEnabled: boolean; depreciationEnabled: boolean }) => void;
  
  // Production
  annualProduction: number;
  setAnnualProduction: (production: number) => void;
  monthlyProduction: number[];
  setMonthlyProduction: (production: number[]) => void;
  
  // Roof Analysis
  selectedRoofSections: RoofSegment[];
  setSelectedRoofSections: (sections: RoofSegment[]) => void;
  totalRoofArea: number;
  setTotalRoofArea: (area: number) => void;
}

export const useDesignStore = create<DesignState>((set, get) => ({
  // Navigation
  currentStep: 'address',
  setCurrentStep: (step) => {
    set({ currentStep: step });
  },

  // Address Information
  address: '',
  setAddress: (address) => set({ address }),
  zipCode: '',
  setZipCode: (zipCode) => set({ zipCode }),

  // Usage & Utility
  monthlyBill: 150,
  setMonthlyBill: (amount) => set({ monthlyBill: amount }),
  utilityProvider: '',
  setUtilityProvider: (provider) => set({ utilityProvider: provider }),
  electricityRate: 0.15,
  setElectricityRate: (rate) => set({ electricityRate: rate }),
  baseCost: 0,
  setBaseCost: (cost) => set({ baseCost: cost }),

  // System Design
  systemSize: 0,
  setSystemSize: (size) => set({ systemSize: size }),
  panelCount: 1,  // Start with minimum of 1 panel
  setPanelCount: (count) => set({ panelCount: count }),
  batteryCount: 0,
  setBatteryCount: (count) => set({ batteryCount: count }),

  // Incentives
  incentives: {
    federal: 30,
    state: 0,
    utility: 0,
    itcEnabled: true,
    depreciationEnabled: true
  },
  setIncentives: (incentives) => set({ incentives }),

  // Production
  annualProduction: 0,
  setAnnualProduction: (production) => set({ annualProduction: production }),
  monthlyProduction: Array(12).fill(0),
  setMonthlyProduction: (production) => set({ monthlyProduction: production }),

  // Roof Analysis
  selectedRoofSections: [],
  setSelectedRoofSections: (sections) => set({ selectedRoofSections: sections }),
  totalRoofArea: 0,
  setTotalRoofArea: (area) => set({ totalRoofArea: area })
}));