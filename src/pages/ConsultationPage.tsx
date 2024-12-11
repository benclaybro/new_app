import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { CloserSelection } from '../components/scheduling/steps/CloserSelection';
import { DateTimeSelection } from '../components/scheduling/steps/DateTimeSelection';
import { ContactForm } from '../components/scheduling/steps/ContactForm';
import { ConfirmationPage } from '../components/scheduling/steps/ConfirmationPage';
import { getLead } from '../utils/leads';
import type { Database } from '../types/supabase';

type Lead = Database['public']['Tables']['leads']['Row'];

type SchedulingStep = 'closer' | 'datetime' | 'contact' | 'confirmation';

export const ConsultationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const leadId = location.state?.leadId;
  const address = location.state?.address;
  const isFollowUp = location.state?.isFollowUp;
  const [currentStep, setCurrentStep] = useState<SchedulingStep>('closer');
  const [selectedCloserId, setSelectedCloserId] = useState<string>('');
  const [selectedCloserName, setSelectedCloserName] = useState<string>('');
  const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(null);
  const [lead, setLead] = useState<Lead | null>(null);
  const [appointmentDetails, setAppointmentDetails] = useState<any>(null);
  const [loadingLead, setLoadingLead] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeadData = async () => {
      // If we have a direct address from results page
      if (address && !leadId) {
        setLead({
          id: 'new',
          address,
          name: 'New Lead',
          contact_info: {},
          status: 'new',
          notes: null,
          aurora_project_id: null,
          assigned_to: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        return;
      }

      // If we have a lead ID from lead details page
      if (leadId) {
        try {
          setLoadingLead(true);
          const leadData = await getLead(leadId);
          setLead(leadData);
        } catch (error) {
          console.error('Error fetching lead:', error);
          setError('Failed to load lead data');
        } finally {
          setLoadingLead(false);
        }
      }
    };

    fetchLeadData();
  }, [leadId, address]);

  const handleCloserSelect = (closerId: string, closerName: string) => {
    setSelectedCloserId(closerId);
    setSelectedCloserName(closerName);
    setCurrentStep('datetime');
  };

  const handleDateTimeSelect = (dateTime: Date) => {
    setSelectedDateTime(dateTime);
    setCurrentStep('contact');
  };

  const handleSubmit = (formData: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    notes: string;
  }) => {
    const appointment = {
      type: 'consultation',
      closer: selectedCloserName,
      dateTime: selectedDateTime,
      lead,
      ...formData
    };
    setAppointmentDetails(appointment);
    setCurrentStep('confirmation');
  };

  const handleClose = () => {
    const returnPath = location.state?.from || '/dashboard';
    navigate(returnPath);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6 flex items-center">
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <ChevronLeft className="h-6 w-6 text-[#CF7128]" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 ml-2">
            {isFollowUp ? 'Schedule Follow Up' : 'Schedule Consultation'}
          </h1>
        </div>

        {loadingLead ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#CF7128]"></div>
          </div>
        ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center mb-6">
              <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#CF7128] transition-all duration-300"
                  style={{
                    width: currentStep === 'closer' ? '25%' : 
                           currentStep === 'datetime' ? '50%' :
                           currentStep === 'contact' ? '75%' : '100%'
                  }}
                />
              </div>
            </div>

            {currentStep === 'closer' && (
              <CloserSelection onSelect={handleCloserSelect} />
            )}

            {currentStep === 'datetime' && (
              <DateTimeSelection 
                closerId={selectedCloserId}
                closerName={selectedCloserName}
                onSelect={handleDateTimeSelect}
                onBack={() => setCurrentStep('closer')}
                isFollowUp={isFollowUp}
              />
            )}

            {currentStep === 'contact' && (
              <ContactForm
                onSubmit={handleSubmit}
                selectedCloserId={selectedCloserId}
                selectedDateTime={selectedDateTime}
                lead={lead}
                onBack={() => setCurrentStep('datetime')}
                isFollowUp={isFollowUp}
              />
            )}

            {currentStep === 'confirmation' && appointmentDetails && (
              <ConfirmationPage
                appointment={appointmentDetails}
                onClose={handleClose}
              />
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
};