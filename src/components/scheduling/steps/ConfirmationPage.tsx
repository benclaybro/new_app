import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Calendar, User, MapPin, Phone, Mail, DollarSign } from 'lucide-react';

interface ConfirmationPageProps {
  appointment: {
    closer: string;
    dateTime: Date;
    lead: {
      address: string;
      contact_info: any;
    } | null;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };
  onClose: () => void;
}

export const ConfirmationPage: React.FC<ConfirmationPageProps> = ({
  appointment,
  onClose
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[50vh] sm:min-h-0 text-center"
    >
      <div className="mb-6">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Appointment Confirmed!</h2>
        <p className="text-gray-600">
          Your solar consultation has been scheduled
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-4 text-left">
        <div className="flex items-center gap-3 border-b pb-3">
          <Calendar className="h-5 w-5 text-[#CF7128]" />
          <div>
            <p className="text-sm text-gray-600">Appointment Time</p>
            <p className="font-medium">
              {appointment.dateTime.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
              {' at '}
              {appointment.dateTime.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-b pb-3">
          <User className="h-5 w-5 text-[#CF7128]" />
          <div>
            <p className="text-sm text-gray-600">Solar Consultant</p>
            <p className="font-medium">{appointment.closer}</p>
          </div>
        </div>

        {appointment.lead && (
          <>
            <div className="flex items-center gap-3 border-b pb-3">
              <MapPin className="h-5 w-5 text-[#CF7128]" />
              <div>
                <p className="text-sm text-gray-600">Installation Address</p>
                <p className="font-medium break-words">{appointment.lead.address}</p>
              </div>
            </div>

            {appointment.lead.contact_info?.monthly_bill && (
              <div className="flex items-center gap-3 border-b pb-3">
                <DollarSign className="h-5 w-5 text-[#CF7128]" />
                <div>
                  <p className="text-sm text-gray-600">Current Monthly Bill</p>
                  <p className="font-medium">${appointment.lead.contact_info.monthly_bill}</p>
                </div>
              </div>
            )}
          </>
        )}

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-[#CF7128]" />
            <div>
              <p className="text-sm text-gray-600">Contact Name</p>
              <p className="font-medium">{appointment.firstName} {appointment.lastName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-[#CF7128]" />
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-medium">{appointment.phone}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-[#CF7128]" />
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{appointment.email}</p>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full bg-[#CF7128] text-white font-bold py-3 rounded-lg hover:bg-[#B86422] transition-colors"
      >
        Close
      </button>
    </motion.div>
  );
};