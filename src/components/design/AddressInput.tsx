import React, { useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { useDesignStore } from '../../store/designStore';
import { loadGoogleMapsApi } from '../../utils/api';

export const AddressInput = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const { setAddress, setCurrentStep } = useDesignStore();

  useEffect(() => {
    let mounted = true;

    const initAutocomplete = async () => {
      if (!inputRef.current) return;

      try {
        await loadGoogleMapsApi();
        
        if (!mounted) return;

        autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
          componentRestrictions: { country: 'us' },
          fields: ['formatted_address', 'geometry'],
          types: ['address']
        });

        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current?.getPlace();
          if (place?.formatted_address) {
            setAddress(place.formatted_address);
            setCurrentStep('usage');
          }
        });
      } catch (error) {
        console.error('Error initializing Google Maps:', error);
        // Show user-friendly error message
        if (inputRef.current) {
          inputRef.current.placeholder = 'Error loading address search. Please try again later.';
          inputRef.current.disabled = true;
        }
      }
    };

    initAutocomplete();

    return () => {
      mounted = false;
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [setAddress, setCurrentStep]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const address = inputRef.current?.value;
    if (address) {
      setAddress(address);
      setCurrentStep('usage');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Enter your address"
          className="w-full px-6 py-4 text-lg rounded-full border border-gray-300 focus:border-[#CF7128] focus:ring-2 focus:ring-[#CF7128]/20 outline-none transition-all"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#CF7128] text-white p-3 rounded-full hover:bg-[#B86422] transition-colors"
        >
          <Search className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
};