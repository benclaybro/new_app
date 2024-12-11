import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock } from 'lucide-react';
import { useDesignStore } from '../../store/designStore';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export const ProposalCTA = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { address } = useDesignStore();
  const { profile } = useAuthStore();
  const leadId = location.state?.leadId;

  const handleScheduleConsultation = () => {
    navigate('/schedule', { 
      state: { 
        from: location.state?.from || '/results',
        leadId,
        address
      }
    });
  };

  const handleScheduleFollowUp = () => {
    navigate('/schedule', {
      state: {
        from: location.state?.from || '/results',
        leadId,
        address,
        isFollowUp: true
      }
    });
  };

  return (
    <div className="space-y-3">
      <button 
        onClick={handleScheduleConsultation}
        className="w-full bg-[#CF7128] hover:bg-[#B86422] text-white text-lg sm:text-xl font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl transition-colors flex items-center justify-center gap-2 sm:gap-3"
      >
        <Calendar className="h-5 w-5 sm:h-6 sm:w-6" />
        Schedule Consultation
      </button>
      {profile && (
        <button
          onClick={handleScheduleFollowUp}
          className="w-full bg-white border-2 border-[#CF7128] text-[#CF7128] hover:bg-[#CF7128] hover:text-white text-lg sm:text-xl font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl transition-colors flex items-center justify-center gap-2 sm:gap-3"
        >
          <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
          Schedule Follow Up
        </button>
      )}
    </div>
  );
};