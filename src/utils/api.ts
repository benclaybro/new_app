import axios from 'axios';
import { Loader } from '@googlemaps/js-api-loader';
import { API_CONFIG } from '../config/api';
import type { RoofSegment } from '../types/solar';

let mapsLoaded = false;
let geocoder: google.maps.Geocoder | null = null;

const FALLBACK_IMAGE_SIZE = '800x600';
const FALLBACK_ZOOM = '20';

const loader = new Loader({
  apiKey: API_CONFIG.GOOGLE_MAPS_API_KEY,
  version: 'weekly',
  libraries: ['places', 'drawing', 'geometry'],
  id: 'google-maps-script'
});

const checkApiKey = () => {
  if (!API_CONFIG.GOOGLE_MAPS_API_KEY) {
    console.warn('Google Maps API key not configured. Please add your API key to the .env file.');
    return false;
  }
  return true;
};

export const loadGoogleMapsScript = async () => {
  try {
    if (!checkApiKey()) {
      throw new Error('Google Maps API key not configured');
    }

    if (!mapsLoaded) {
      await loader.load();
      mapsLoaded = true;
      geocoder = new google.maps.Geocoder();
    }
    return Promise.resolve();
  } catch (error) {
    console.error('Error loading Google Maps:', error);
    throw error;
  }
};

const getFallbackSatelliteUrl = (lat: number, lng: number): string => {
  if (!API_CONFIG.GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key not configured');
  }
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${FALLBACK_ZOOM}&size=${FALLBACK_IMAGE_SIZE}&maptype=satellite&key=${API_CONFIG.GOOGLE_MAPS_API_KEY}`;
};

export const getSolarData = async ({ lat, lng }: { lat: number; lng: number }) => {
  if (!API_CONFIG.GOOGLE_SOLAR_API_KEY) {
    console.warn('Missing Google Solar API key, using fallback satellite view');
    return {
      imageUrl: getFallbackSatelliteUrl(lat, lng),
      roofSegments: [],
      buildingStats: {
        maxArrayAreaMeters2: 100, // Default estimate
        maxSunshineHoursPerYear: 1600,
        carbonOffsetFactorKgPerMwh: 400,
        wholeRoofStats: null
      }
    };
  }

  try {
    // Fetch building insights for roof data
    const buildingInsightsUrl = `https://solar.googleapis.com/v1/buildingInsights:findClosest`;
    
    const buildingInsightsResponse = await axios.get(buildingInsightsUrl, {
      params: {
        'location.latitude': lat,
        'location.longitude': lng,
        key: API_CONFIG.GOOGLE_SOLAR_API_KEY
      }
    });

    if (!buildingInsightsResponse.data) {
      return {
        imageUrl: getFallbackSatelliteUrl(lat, lng),
        roofSegments: [],
        buildingStats: {
          maxArrayAreaMeters2: 100,
          maxSunshineHoursPerYear: 1600,
          carbonOffsetFactorKgPerMwh: 400,
          wholeRoofStats: null
        }
      };
    }

    const imageUrl = getFallbackSatelliteUrl(lat, lng);

    // Process roof segments from building insights
    const roofSegments: RoofSegment[] = buildingInsightsResponse.data.solarPotential?.roofSegmentStats?.map((segment: any, index: number) => ({
      id: `segment-${index}`, // Ensure unique ID using index
      area: segment.pitchedRoofArea || 0,
      azimuth: segment.azimuthDegrees,
      pitch: segment.pitchDegrees,
      center: {
        latitude: segment.center.latitude,
        longitude: segment.center.longitude
      },
      boundingBox: {
        sw: {
          latitude: segment.boundingBox.sw.latitude,
          longitude: segment.boundingBox.sw.longitude
        },
        ne: {
          latitude: segment.boundingBox.ne.latitude,
          longitude: segment.boundingBox.ne.longitude
        }
      }
    })) || [];

    return {
      imageUrl,
      roofSegments,
      buildingStats: {
        maxArrayAreaMeters2: buildingInsightsResponse.data.solarPotential?.maxArrayAreaMeters2 || 0,
        maxSunshineHoursPerYear: buildingInsightsResponse.data.solarPotential?.maxSunshineHoursPerYear || 0,
        carbonOffsetFactorKgPerMwh: buildingInsightsResponse.data.solarPotential?.carbonOffsetFactorKgPerMwh || 0,
        wholeRoofStats: buildingInsightsResponse.data.solarPotential?.wholeRoofStats || null
      }
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error?.message || error.message;
      throw new Error(`Solar API request failed: ${errorMessage}`);
    }
    console.warn('Error fetching solar data, using fallback:', error);
    throw error;
  }
};

export const getUtilityData = async (zipCode: string) => {
  if (!API_CONFIG.NREL_API_KEY || !API_CONFIG.EIA_API_KEY) {
    throw new Error('Missing required API keys');
  }

  if (!zipCode?.match(/^\d{5}$/)) {
    throw new Error('Please enter a valid 5-digit ZIP code');
  }

  try {
    await loadGoogleMapsScript();

    if (!geocoder) {
      throw new Error('Google Maps Geocoder not initialized');
    }

    const geocodeResponse = await geocoder.geocode({
      address: zipCode,
      componentRestrictions: { country: 'US' }
    });

    if (!geocodeResponse.results?.[0]) {
      throw new Error('ZIP code not found');
    }

    const location = geocodeResponse.results[0].geometry.location;
    const lat = location.lat();
    const lng = location.lng();

    // Get state code for EIA API
    const stateComponent = geocodeResponse.results[0].address_components?.find(
      component => component.types.includes('administrative_area_level_1')
    );
    
    if (!stateComponent?.short_name) {
      throw new Error('Could not determine state from ZIP code');
    }

    // Fetch utility data from NREL API
    const nrelResponse = await axios.get('https://developer.nrel.gov/api/utility_rates/v3.json', {
      params: {
        api_key: API_CONFIG.NREL_API_KEY,
        lat,
        lon: lng
      }
    });

    if (!nrelResponse.data?.outputs?.utility_name) {
      throw new Error('No utility data found for this location');
    }

    // Fetch electricity rate data from EIA API
    const eiaResponse = await axios.get('https://api.eia.gov/v2/electricity/retail-sales/data', {
      params: {
        api_key: API_CONFIG.EIA_API_KEY,
        frequency: 'monthly',
        data: ['price'],
        'facets[stateid][]': stateComponent.short_name,
        'facets[sectorid][]': 'RES',
        'sort[0][column]': 'period',
        'sort[0][direction]': 'desc',
        offset: 0,
        length: 1
      }
    });

    if (!eiaResponse.data?.response?.data?.[0]?.price) {
      throw new Error('No electricity rate data found');
    }

    return {
      utilityInfo: [{
        utility_name: nrelResponse.data.outputs.utility_name,
        company_id: nrelResponse.data.outputs.utility_id || 'unknown',
        utility_type: 'Electric'
      }],
      electricityRate: eiaResponse.data.response.data[0].price / 100, // Convert cents to dollars
      baseCost: nrelResponse.data.outputs.residential || 10 // Default to $10 if not available
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error?.message || error.message;
      throw new Error(`API request failed: ${errorMessage}`);
    }
    
    if (error instanceof Error) {
      throw new Error(`Utility data error: ${error.message}`);
    }
    
    throw new Error('Failed to fetch utility data');
  }
};