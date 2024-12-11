import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { CloserSelection } from './steps/CloserSelection';
import { DateTimeSelection } from './steps/DateTimeSelection';
import { ContactForm } from './steps/ContactForm';
import { ConfirmationPage } from './steps/ConfirmationPage';
import { useDesignStore } from '../../store/designStore';

type SchedulingStep = 'closer' | 'datetime' | 'contact' | 'confirmation';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConsultationModal: React.FC<ConsultationModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState<SchedulingStep>('closer');
  const [selectedCloser, setSelectedCloser] = useState<string>('');
  const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(null);
  const [appointmentDetails, setAppointmentDetails] = useState<any>(null);
  const { address, monthlyBill } = useDesignStore();

  const handleCloserSelect = (closer: string) => {
    setSelectedCloser(closer);
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
  }) => {
    const appointment = {
      type: 'consultation',
      closer: selectedCloser,
      dateTime: selectedDateTime,
      address,
      monthlyBill,
      ...formData
    };
    setAppointmentDetails(appointment);
    setCurrentStep('confirmation');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/50 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden my-4 sm:my-8"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-50"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>

            <div className="p-4 sm:p-6">
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
                  closer={selectedCloser}
                  onSelect={handleDateTimeSelect}
                  onBack={() => setCurrentStep('closer')}
                />
              )}

              {currentStep === 'contact' && (
                <ContactForm
                  onSubmit={handleSubmit}
                  onBack={() => setCurrentStep('datetime')}
                />
              )}

              {currentStep === 'confirmation' && appointmentDetails && (
                <ConfirmationPage
                  appointment={appointmentDetails}
                  onClose={onClose}
                />
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};