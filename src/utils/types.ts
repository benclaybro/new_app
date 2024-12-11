export interface Bounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface GeoTiff {
  width: number;
  height: number;
  rasters: Array<Uint8Array>;
  bounds: Bounds;
}

export interface DataLayersResponse {
  imageryDate: {
    year: number;
    month: number;
    day: number;
  };
  imageryProcessedDate: {
    year: number;
    month: number;
    day: number;
  };
  rgbUrl: string;
  dsmUrl: string;
  maskUrl: string;
  annualFluxUrl: string;
  monthlyFluxUrl: string;
  hourlyShadeUrls: string[];
  imageryQuality: string;
}

export interface RoofSegment {
  azimuthDegrees: number;
  pitchDegrees: number;
  centerPoint: {
    latitude: number;
    longitude: number;
  };
  boundingBox: {
    sw: { latitude: number; longitude: number };
    ne: { latitude: number; longitude: number };
  };
  planeHeightMeters: number;
  planeWidthMeters: number;
}