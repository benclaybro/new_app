/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_API_KEY: string
  readonly VITE_GOOGLE_SOLAR_API_KEY: string
  readonly VITE_NREL_API_KEY: string
  readonly VITE_EIA_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}