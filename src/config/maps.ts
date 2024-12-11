import { API_CONFIG } from './api';

export const GOOGLE_MAPS_CONFIG = {
  apiKey: API_CONFIG.GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY',
  id: 'google-maps-script',
  version: 'weekly',
  libraries: ['places', 'drawing', 'geometry'] as const
};