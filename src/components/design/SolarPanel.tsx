import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoofSegment } from '../../types/solar';
import { createRoofGeometry, calculateOptimalPanelLayout } from '../../utils/solarApi';
import { PANEL_DIMENSIONS } from '../../constants/solar';

interface SolarPanelProps {
  segment: RoofSegment;
  panelCount: number;
}

export const SolarPanel: React.FC<SolarPanelProps> = ({ segment, panelCount }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Create roof geometry
    const roofGeometry = createRoofGeometry(segment);
    const roofMaterial = new THREE.MeshPhongMaterial({
      color: 0x808080,
      transparent: true,
      opacity: 0.5
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    scene.add(roof);

    // Calculate panel layout
    const panelWidth = PANEL_DIMENSIONS.width / 1000; // Convert mm to meters
    const panelHeight = PANEL_DIMENSIONS.height / 1000;
    const spacing = 0.2; // 20cm spacing between panels

    const layout = calculateOptimalPanelLayout(
      segment,
      panelWidth,
      panelHeight,
      spacing
    );

    // Create panel geometries
    const panelGeometry = new THREE.PlaneGeometry(panelWidth, panelHeight);
    const panelMaterial = new THREE.MeshPhongMaterial({
      color: 0x000066,
      side: THREE.DoubleSide
    });

    // Add panels to the scene
    const numPanels = Math.min(panelCount, layout.positions.length);
    for (let i = 0; i < numPanels; i++) {
      const panel = new THREE.Mesh(panelGeometry, panelMaterial);
      panel.position.copy(layout.positions[i]);
      panel.rotation.copy(roof.rotation);
      scene.add(panel);
    }

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Position camera
    camera.position.z = 5;
    camera.position.y = 2;
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Store refs
    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;

    // Cleanup
    return () => {
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [segment, panelCount]);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0"
      style={{ pointerEvents: 'none' }}
    />
  );
};

export default SolarPanel;