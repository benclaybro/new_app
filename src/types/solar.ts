export interface RoofSegment {
  id: string;
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

export interface SolarProposal {
  systemSize: number;
  numPanels: number;
  yearlyProduction: number;
  cashPrice: number;
  financedPrice: number;
  monthlyPayment: number;
  yearlyBill: number;
  yearlySavings: number;
}