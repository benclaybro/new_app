import { fromArrayBuffer } from 'geotiff';
import { DataLayersResponse, RoofSegment } from '../types/solar';
import * as THREE from 'three';
import { API_CONFIG } from '../config/api';

export async function fetchBuildingInsights(lat: number, lng: number) {
  const url = `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${lat}&location.longitude=${lng}&key=${API_CONFIG.GOOGLE_SOLAR_API_KEY}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch building insights');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching building insights:', error);
    throw error;
  }
}

export async function fetchDataLayers(lat: number, lng: number): Promise<DataLayersResponse> {
  const url = `https://solar.googleapis.com/v1/dataLayers:get?location.latitude=${lat}&location.longitude=${lng}&key=${API_CONFIG.GOOGLE_SOLAR_API_KEY}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch data layers');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data layers:', error);
    throw error;
  }
}

export async function loadGeoTiff(url: string) {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return await fromArrayBuffer(arrayBuffer);
  } catch (error) {
    console.error('Error loading GeoTIFF:', error);
    throw error;
  }
}

export function createRoofGeometry(segment: RoofSegment): THREE.BufferGeometry {
  const geometry = new THREE.PlaneGeometry(
    segment.boundingBox.ne.longitude - segment.boundingBox.sw.longitude,
    segment.boundingBox.ne.latitude - segment.boundingBox.sw.latitude
  );
  
  // Apply pitch rotation (convert degrees to radians)
  if (segment.pitch) {
    geometry.rotateX(-segment.pitch * Math.PI / 180);
  }
  
  // Apply azimuth rotation (convert degrees to radians)
  if (segment.azimuth) {
    geometry.rotateY(segment.azimuth * Math.PI / 180);
  }
  
  return geometry;
}

export function calculateOptimalPanelLayout(
  segment: RoofSegment,
  panelWidth: number,
  panelHeight: number,
  spacing: number
): { positions: THREE.Vector3[]; count: number } {
  const positions: THREE.Vector3[] = [];
  
  // Calculate available space
  const width = segment.boundingBox.ne.longitude - segment.boundingBox.sw.longitude;
  const height = segment.boundingBox.ne.latitude - segment.boundingBox.sw.latitude;
  
  // Calculate number of panels that can fit
  const maxRows = Math.floor(height / (panelHeight + spacing));
  const maxCols = Math.floor(width / (panelWidth + spacing));
  
  // Calculate starting position to center the array
  const startX = -(width / 2) + (panelWidth / 2);
  const startY = -(height / 2) + (panelHeight / 2);
  
  // Generate panel positions
  for (let row = 0; row < maxRows; row++) {
    for (let col = 0; col < maxCols; col++) {
      const x = startX + col * (panelWidth + spacing);
      const y = startY + row * (panelHeight + spacing);
      const z = 0;
      
      positions.push(new THREE.Vector3(x, y, z));
    }
  }
  
  return {
    positions,
    count: positions.length
  };
}

export function calculateSolarPotential(
  segment: RoofSegment,
  annualFlux: number[],
  maskData: number[]
): number {
  let totalPotential = 0;
  let validPixels = 0;
  
  // Calculate the solar potential for each pixel in the segment
  for (let i = 0; i < annualFlux.length; i++) {
    if (maskData[i] > 0) { // Check if pixel is part of the roof
      totalPotential += annualFlux[i];
      validPixels++;
    }
  }
  
  // Return average annual solar potential in kWh/m²
  return validPixels > 0 ? totalPotential / validPixels : 0;
}