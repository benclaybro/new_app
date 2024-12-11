export const API_CONFIG = {
  GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  GOOGLE_SOLAR_API_KEY: import.meta.env.VITE_GOOGLE_SOLAR_API_KEY,
  NREL_API_KEY: import.meta.env.VITE_NREL_API_KEY,
  EIA_API_KEY: import.meta.env.VITE_EIA_API_KEY
} as const;