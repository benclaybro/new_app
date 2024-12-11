import { Loader } from '@googlemaps/js-api-loader';

const GOOGLE_MAPS_API_KEY = 'AIzaSyDKm5SrUJNPaQOU0lpa6swSWkiuKTpzEN0';
const loader = new Loader({
  apiKey: GOOGLE_MAPS_API_KEY,
  version: 'weekly',
  libraries: ['places', 'drawing', 'geometry'],
  id: 'google-maps-script'
});

export const loadGoogleMapsScript = () => loader.load();

export const getSolarData = async ({ lat, lng }: { lat: number; lng: number }) => {
  try {
    // Mock data representing optimal mounting planes from Solar API
    // Coordinates are adjusted to match the actual roof segments
    return [
      // Main roof section - front
      {
        azimuthDegrees: 180,
        pitchDegrees: 20,
        centerPoint: {
          latitude: lat,
          longitude: lng
        },
        boundingBox: {
          sw: { latitude: lat - 0.00002, longitude: lng - 0.00004 },
          ne: { latitude: lat + 0.00002, longitude: lng + 0.00004 }
        },
        planeHeightMeters: 3.68, // 2 panels high
        planeWidthMeters: 4.12  // 4 panels wide
      },
      // Main roof section - back
      {
        azimuthDegrees: 180,
        pitchDegrees: 20,
        centerPoint: {
          latitude: lat + 0.00004,
          longitude: lng
        },
        boundingBox: {
          sw: { latitude: lat + 0.00002, longitude: lng - 0.00004 },
          ne: { latitude: lat + 0.00006, longitude: lng + 0.00004 }
        },
        planeHeightMeters: 3.68,
        planeWidthMeters: 4.12
      }
    ];
  } catch (error) {
    console.error('Error fetching solar data:', error);
    return [];
  }
};

export const calculatePanelLayout = (
  segment: {
    planeWidthMeters: number;
    planeHeightMeters: number;
  },
  panelCount: number
) => {
  const maxCols = Math.floor(segment.planeWidthMeters / 1.03); // Panel width in meters
  const maxRows = Math.floor(segment.planeHeightMeters / 1.84); // Panel height in meters
  
  const totalPossiblePanels = maxRows * maxCols;
  const actualPanels = Math.min(panelCount, totalPossiblePanels);
  
  // Try to make it as square as possible while respecting max dimensions
  const cols = Math.min(Math.ceil(Math.sqrt(actualPanels)), maxCols);
  const rows = Math.min(Math.ceil(actualPanels / cols), maxRows);
  
  return { rows, cols };
};