import React from 'react';
import { SolarPanel } from './SolarPanel';
import { PANEL_DIMENSIONS } from '../../constants/solar';

interface RoofSegmentProps {
  map: google.maps.Map;
  segment: {
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
  };
  numPanels: number;
}

export const RoofSegment: React.FC<RoofSegmentProps> = ({ map, segment, numPanels }) => {
  // Convert panel dimensions from mm to meters
  const panelWidth = PANEL_DIMENSIONS.width / 1000;  // 1.03m
  const panelHeight = PANEL_DIMENSIONS.height / 1000; // 1.84m
  
  // Add spacing between panels (20cm gap)
  const spacingMeters = 0.2;
  const effectivePanelWidth = panelWidth + spacingMeters;
  const effectivePanelHeight = panelHeight + spacingMeters;
  
  // Calculate maximum panels that can fit in the segment
  const maxCols = Math.floor(segment.planeWidthMeters / effectivePanelWidth);
  const maxRows = Math.floor(segment.planeHeightMeters / effectivePanelHeight);
  
  const totalPossiblePanels = maxRows * maxCols;
  const actualPanels = Math.min(numPanels, totalPossiblePanels);
  
  // Calculate optimal layout
  const cols = Math.min(Math.ceil(Math.sqrt(actualPanels)), maxCols);
  const rows = Math.ceil(actualPanels / cols);

  // Calculate total width and height of the panel array
  const totalWidth = cols * effectivePanelWidth;
  const totalHeight = rows * effectivePanelHeight;

  // Calculate starting position to center the array on the roof segment
  const segmentWidth = segment.boundingBox.ne.longitude - segment.boundingBox.sw.longitude;
  const segmentHeight = segment.boundingBox.ne.latitude - segment.boundingBox.sw.latitude;

  // Convert meters to degrees for positioning
  const metersToDegreesLat = segmentHeight / segment.planeHeightMeters;
  const metersToDegreesLng = segmentWidth / segment.planeWidthMeters;

  // Calculate offset to center the array
  const startLat = segment.centerPoint.latitude - ((totalHeight * metersToDegreesLat) / 2);
  const startLng = segment.centerPoint.longitude - ((totalWidth * metersToDegreesLng) / 2);

  const panels = [];

  // Generate panel positions with proper spacing
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const panelIndex = row * cols + col;
      if (panelIndex >= actualPanels) break;

      // Calculate exact position for each panel with spacing
      const lat = startLat + (row * effectivePanelHeight * metersToDegreesLat);
      const lng = startLng + (col * effectivePanelWidth * metersToDegreesLng);

      panels.push({
        position: { lat, lng },
        rotation: segment.azimuthDegrees,
        tilt: segment.pitchDegrees
      });
    }
  }

  return (
    <>
      {panels.map((panel, index) => (
        <SolarPanel
          key={`panel-${index}`}
          map={map}
          position={panel.position}
          rotation={panel.rotation}
          tilt={panel.tilt}
        />
      ))}
    </>
  );
};