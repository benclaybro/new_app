import React from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';
import { GOOGLE_MAPS_CONFIG } from '../../config/maps';

interface MapWrapperProps {
  children: React.ReactNode;
}

export const MapWrapper: React.FC<MapWrapperProps> = ({ children }) => {
  return (
    <Wrapper
      apiKey={GOOGLE_MAPS_CONFIG.apiKey}
      version={GOOGLE_MAPS_CONFIG.version}
      libraries={GOOGLE_MAPS_CONFIG.libraries}
      id={GOOGLE_MAPS_CONFIG.id}
    >
      {children}
    </Wrapper>
  );
};