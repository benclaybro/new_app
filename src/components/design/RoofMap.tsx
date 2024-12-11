import React, { useEffect, useState } from 'react';
import { getSolarData, loadGoogleMapsScript } from '../../utils/api';
import { API_CONFIG } from '../../config/api';
import { useDesignStore } from '../../store/designStore';
import { AlertTriangle } from 'lucide-react';
import { RoofSegment } from '../../types/solar';
import { SolarPanel } from './SolarPanel';

interface RoofMapProps {
  address: string;
}

const RoofMap: React.FC<RoofMapProps> = ({ address }) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [roofSegments, setRoofSegments] = useState<RoofSegment[]>([]);
  const { panelCount, setSystemSize } = useDesignStore();

  useEffect(() => {
    if (!address) return;

    const loadMapsAndFetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        await loadGoogleMapsScript();

        // Wait for Maps to be fully loaded
        if (!window.google?.maps) {
          throw new Error('Google Maps not loaded');
        }

        const geocoder = new google.maps.Geocoder();
        const response = await geocoder.geocode({ address });

        if (!response.results?.[0]?.geometry?.location) {
          throw new Error('Address not found');
        }

        const location = response.results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();

        try {
          const data = await getSolarData({ lat, lng });
          
          if (!data.imageUrl) {
            throw new Error('Unable to load roof image');
          }

          setImageUrl(data.imageUrl);
          setRoofSegments(data.roofSegments);
          
          // Calculate total system size based on roof segments and solar potential 
          const estimatedSystemSize = data.buildingStats?.maxArrayAreaMeters2 * 0.2 || 10; // 20% efficiency or fallback
          setSystemSize(estimatedSystemSize);
        } catch (solarError) {
          console.warn('Solar data error:', solarError);
          setError('Unable to load solar data. Using default satellite view.');
          // Still show satellite view even if solar data fails 
          const fallbackUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=20&size=800x600&maptype=satellite&key=${API_CONFIG.GOOGLE_MAPS_API_KEY}`;
          setImageUrl(fallbackUrl);
        }

        setLoading(false);
      } catch (error) {
        console.warn('Geocoding error:', error);
        setError('Unable to load roof data. Please verify the address is correct.');
        setLoading(false);
      }
    };

    loadMapsAndFetchData();
  }, [address, setSystemSize]);

  return (
    <div className="relative">
      <div 
        className="w-full rounded-lg overflow-hidden bg-gray-50 aspect-[2/1] flex items-center justify-center"
      >
        {loading ? (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        ) : imageUrl ? (
          <>
            <img 
              src={imageUrl}
              alt="Roof satellite view"
              className="w-full h-auto rounded-lg"
              style={{ imageRendering: 'high-quality' }}
            />
            {roofSegments?.map((segment) => (
              <SolarPanel
                key={segment.id}
                segment={segment}
                panelCount={Math.floor(panelCount / roofSegments.length)}
              />
            ))}
          </>
        ) : (
          <div className="flex items-center justify-center p-8 bg-gray-100 text-gray-600">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              <span>
                Unable to load satellite view
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg text-sm">
        {panelCount} Panels
      </div>
      {error && (
        <div className="absolute top-4 left-4 bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default RoofMap;