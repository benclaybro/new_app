import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, User, Mail, Phone, MapPin, Upload } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { useLocation } from 'react-router-dom';
import { createConsultation } from '../../../utils/consultations';
import type { Database } from '../../../types/supabase';

type Lead = Database['public']['Tables']['leads']['Row'];

interface ContactFormProps {
  onSubmit: (data: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    creditScore: boolean;
    notMoving: boolean;
    allPresent: boolean;
    solarFocus: string;
    paymentPreference: string;
    specialOffer: string;
    utilityBill?: File;
    notes: string;
  }) => void;
  onBack: () => void;
  selectedCloserId: string;
  selectedDateTime: Date | null;
  lead?: Lead | null;
  isFollowUp?: boolean;
}

type SolarFocus = 'Tax Incentives' | 'Monthly Savings' | 'Avoid Inflation' | 'Control over power' | 'Off grid set up';
type PaymentPreference = 'Financed' | 'Cash' | 'Open to Both';
type SpecialOffer = '12 Month Promo' | '18 Month Promo' | '24 Month Promo' | 'None';

export const ContactForm: React.FC<ContactFormProps> = ({
  onSubmit,
  onBack,
  selectedCloserId,
  selectedDateTime,
  lead,
  isFollowUp = false
}) => {
  const { profile } = useAuthStore();
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    form: ''
  });
  const [isValid, setIsValid] = useState(false);
  const location = useLocation();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: profile?.phone || '',
    email: profile?.email || '',
    creditScore: '',
    notMoving: '',
    allPresent: '',
    solarFocus: '' as SolarFocus,
    paymentPreference: '' as PaymentPreference,
    specialOffer: '' as SpecialOffer,
    utilityBill: undefined as File | undefined,
    notes: ''
  });

  useEffect(() => {
    // Auto-populate from lead contact info if available
    if (lead?.contact_info && typeof lead.contact_info === 'object') {
      const contactInfo = lead.contact_info as any;
      setFormData(prev => ({
        ...prev,
        firstName: contactInfo.firstName || prev.firstName,
        lastName: contactInfo.lastName || prev.lastName,
        phone: contactInfo.phone || prev.phone,
        email: contactInfo.email || prev.email
      }));
    }

    // Auto-populate name from profile
    if (profile?.name) {
      const [firstName, ...lastNameParts] = profile.name.split(' ');
      setFormData(prev => ({
        ...prev,
        firstName: prev.firstName || firstName || '',
        lastName: prev.lastName || lastNameParts.join(' ') || ''
      }));
    }
  }, [profile, lead]);

  useEffect(() => {
    const newErrors = { ...errors };
    let valid = true;

    // Only check qualification questions for regular consultations
    if (!isFollowUp) {
      if (!formData.creditScore || !formData.notMoving || !formData.allPresent) {
        valid = false;
      }

      if (!formData.solarFocus || !formData.paymentPreference || !formData.specialOffer) {
        valid = false;
      }
    }

    // Only show name validation errors if the field has been touched and is empty
    newErrors.firstName = '';
    newErrors.lastName = '';

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      valid = false;
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
      valid = false;
    } else if (!/^\+?\d{10,}$/.test(formData.phone.replace(/[-()\s]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
      valid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
      valid = false;
    }

    setErrors(newErrors);
    setIsValid(valid);
  }, [formData, isFollowUp]);

  // Handle blur events to show validation errors only after user interaction
  const handleBlur = (field: 'firstName' | 'lastName') => {
    const value = formData[field].trim();
    if (!value) {
      setErrors(prev => ({
        ...prev,
        [field]: `${field === 'firstName' ? 'First' : 'Last'} name is required`
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      // Create consultation record
      const consultationData = {
        lead_id: lead?.id || null,
        consultant_id: isFollowUp ? profile?.id : selectedCloserId,
        assigned_to: isFollowUp ? selectedCloserId : profile?.id,
        scheduled_time: selectedDateTime?.toISOString() || new Date().toISOString(),
        status: 'scheduled',
        type: isFollowUp ? 'follow_up' : 'consultation',
        contact_info: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          email: formData.email
        },
        notes: formData.notes,
        qualification_answers: !isFollowUp ? {
          creditScore: formData.creditScore,
          notMoving: formData.notMoving,
          allPresent: formData.allPresent,
          solarFocus: formData.solarFocus,
          paymentPreference: formData.paymentPreference,
          specialOffer: formData.specialOffer
        } : null
      };

      try {
        setErrors(prev => ({ ...prev, form: '' }));
        await createConsultation(consultationData);
        onSubmit(formData);
      } catch (error) {
        console.error('Error saving consultation:', error);
        setErrors(prev => ({ ...prev, form: 'Failed to save consultation' }));
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[50vh] sm:min-h-0"
    >
      <button
        onClick={onBack}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
      >
        <ChevronLeft className="h-5 w-5 mr-1" />
        Back
      </button>

      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Complete Your Information</h2>

      {lead?.address && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-5 w-5 text-[#CF7128]" />
            <h3 className="font-medium text-gray-900">Property Address</h3>
          </div>
          <p className="text-gray-700">{lead.address}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.form && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {errors.form}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                required
                onBlur={() => handleBlur('firstName')}
                aria-required="true"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className={`w-full pl-10 pr-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-[#CF7128]/20 focus:border-[#CF7128] outline-none text-base ${errors.firstName ? 'border-red-500' : ''}`}
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                required
                onBlur={() => handleBlur('lastName')}
                aria-required="true"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#CF7128]/20 focus:border-[#CF7128] outline-none ${errors.lastName ? 'border-red-500' : ''}`}
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="tel"
              required
              aria-required="true"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#CF7128]/20 focus:border-[#CF7128] outline-none ${errors.phone ? 'border-red-500' : ''}`}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="email"
              required
              aria-required="true"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#CF7128]/20 focus:border-[#CF7128] outline-none ${errors.email ? 'border-red-500' : ''}`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Setting Agent
          </label>
          <input
            type="text"
            value={profile?.name || ''}
            disabled
            className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
          />
        </div>

        {!isFollowUp && (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qualification Questions 
                </label>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Credit Score In Mid 600s?</p>
                    <div className="space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="creditScore"
                          value="yes"
                          checked={formData.creditScore === 'yes'}
                          onChange={(e) => setFormData({ ...formData, creditScore: e.target.value })}
                          className="h-4 w-4 text-[#CF7128]"
                          required
                        />
                        <span className="ml-2 text-sm">Yes</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="creditScore"
                          value="no"
                          checked={formData.creditScore === 'no'}
                          onChange={(e) => setFormData({ ...formData, creditScore: e.target.value })}
                          className="h-4 w-4 text-[#CF7128]"
                          required
                        />
                        <span className="ml-2 text-sm">No</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Not Moving Within Next 12 Months?</p>
                    <div className="space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="notMoving"
                          value="yes"
                          checked={formData.notMoving === 'yes'}
                          onChange={(e) => setFormData({ ...formData, notMoving: e.target.value })}
                          className="h-4 w-4 text-[#CF7128]"
                          required
                        />
                        <span className="ml-2 text-sm">Yes</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="notMoving"
                          value="no"
                          checked={formData.notMoving === 'no'}
                          onChange={(e) => setFormData({ ...formData, notMoving: e.target.value })}
                          className="h-4 w-4 text-[#CF7128]"
                          required
                        />
                        <span className="ml-2 text-sm">No</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">All Homeowners Will Be Present?</p>
                    <div className="space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="allPresent"
                          value="yes"
                          checked={formData.allPresent === 'yes'}
                          onChange={(e) => setFormData({ ...formData, allPresent: e.target.value })}
                          className="h-4 w-4 text-[#CF7128]"
                          required
                        />
                        <span className="ml-2 text-sm">Yes</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="allPresent"
                          value="no"
                          checked={formData.allPresent === 'no'}
                          onChange={(e) => setFormData({ ...formData, allPresent: e.target.value })}
                          className="h-4 w-4 text-[#CF7128]"
                          required
                        />
                        <span className="ml-2 text-sm">No</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Focus for Going Solar
                </label>
                <div className="space-y-2">
                  {['Tax Incentives', 'Monthly Savings', 'Avoid Inflation', 'Control over power', 'Off grid set up'].map((focus) => (
                    <label key={focus} className="flex items-center">
                      <input
                        type="radio"
                        name="solarFocus"
                        value={focus}
                        checked={formData.solarFocus === focus}
                        onChange={(e) => setFormData({ ...formData, solarFocus: e.target.value as SolarFocus })}
                        className="h-4 w-4 text-[#CF7128]"
                        required
                      />
                      <span className="ml-2 text-sm">{focus}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Preference
                </label>
                <div className="space-y-2">
                  {['Financed', 'Cash', 'Open to Both'].map((preference) => (
                    <label key={preference} className="flex items-center">
                      <input
                        type="radio"
                        name="paymentPreference"
                        value={preference}
                        checked={formData.paymentPreference === preference}
                        onChange={(e) => setFormData({ ...formData, paymentPreference: e.target.value as PaymentPreference })}
                        className="h-4 w-4 text-[#CF7128]"
                        required
                      />
                      <span className="ml-2 text-sm">{preference}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Offer
                </label>
                <div className="space-y-2">
                  {['12 Month Promo', '18 Month Promo', '24 Month Promo', 'None'].map((offer) => (
                    <label key={offer} className="flex items-center">
                      <input
                        type="radio"
                        name="specialOffer"
                        value={offer}
                        checked={formData.specialOffer === offer}
                        onChange={(e) => setFormData({ ...formData, specialOffer: e.target.value as SpecialOffer })}
                        className="h-4 w-4 text-[#CF7128]"
                        required
                      />
                      <span className="ml-2 text-sm">{offer}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isFollowUp ? 'Follow-up Notes' : 'Additional Notes'}
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none"
            placeholder={isFollowUp ? 
              "Enter your follow-up notes here..." : 
              "Enter any additional notes here..."}
          />
        </div>

        <button
          type="submit"
          disabled={!isValid}
          className="w-full bg-[#CF7128] text-white py-3 rounded-lg font-medium hover:bg-[#B86422] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isFollowUp ? 'Schedule Follow Up' : 'Schedule Appointment'}
        </button>
      </form>
    </motion.div>
  );
};