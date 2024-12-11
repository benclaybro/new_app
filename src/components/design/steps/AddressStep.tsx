import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDesignStore } from '../../../store/designStore';
import { loadGoogleMapsScript } from '../../../utils/api';

export const AddressStep: React.FC = () => {
  const { setAddress, setZipCode, setCurrentStep } = useDesignStore();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let autocomplete: google.maps.places.Autocomplete | null = null;

    const initAutocomplete = async () => {
      try {
        await loadGoogleMapsScript();
        
        if (inputRef.current) {
          autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
            componentRestrictions: { country: 'us' },
            types: ['address'],
          });

          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place.formatted_address) {
              setAddress(place.formatted_address);
              
              // Extract ZIP code from address components
              const zipComponent = place.address_components?.find(
                component => component.types.includes('postal_code')
              );
              
              if (zipComponent) {
                setZipCode(zipComponent.long_name);
                setCurrentStep('usage');
              }
            }
          });
        }
      } catch (error) {
        console.error('Error initializing Google Maps:', error);
      }
    };

    initAutocomplete();

    return () => {
      if (autocomplete) {
        google.maps.event.clearInstanceListeners(autocomplete);
      }
    };
  }, [setAddress, setZipCode, setCurrentStep]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto p-6"
    >
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Enter Your Address</h2>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Enter your address"
          className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
        />
      </div>
      <p className="mt-4 text-sm text-gray-600">
        We'll use this to analyze your roof and solar potential
      </p>
    </motion.div>
  );
};