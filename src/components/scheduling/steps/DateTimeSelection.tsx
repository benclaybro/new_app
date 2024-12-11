import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock, AlertCircle } from 'lucide-react';
import { getAvailableSlots, getAvailableSlotsFromNylas } from '../../../utils/calendar';
import { useSearchParams } from 'react-router-dom';
import { DateTime } from 'luxon';

interface DateTimeSelectionProps {
  closerId: string;
  closerName: string;
  onSelect: (dateTime: Date) => void;
  onBack: () => void;
  isFollowUp?: boolean;
}



// const timeZone = 'Asia/Kolkata';
const timeZone = 'America/Chicago';
const formatTimeFunction = (time: Date, timeZone: string) => {
  // Assuming 'time' is a JavaScript Date object
  
  const dateTimeInTimeZone = DateTime.fromJSDate(time).setZone(timeZone);
  const formattedTime = dateTimeInTimeZone.toFormat('hh:mm a'); // Example: '9:30 PM'
  // console.log("dateTimeInTimeZon", dateTimeInTimeZone.toFormat('HH:mm'))
  return formattedTime;
};
export const DateTimeSelection: React.FC<DateTimeSelectionProps> = ({ 
  closerId, 
  closerName,
  onSelect, 
  onBack, 
  isFollowUp = false 
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<Date[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, _] = useSearchParams();

  useEffect(() => {
    const loadSlots = async () => {
      setLoading(true);
      setError(null);
      const email = searchParams.get("email")
      try {
        if(email=="null"){
          alert("calendar not connected")
          return
        }
        
        
        const slots = await getAvailableSlotsFromNylas(email, selectedDate, 30, timeZone);
        setAvailableSlots(slots);
      } catch (err) {
        console.error('Error loading slots:', err);
        setError('Unable to load available time slots');
      } finally {
        setLoading(false);
      }
    };

    loadSlots();
  }, [selectedDate]);

  const addDays = (date: Date, days: number) => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + days);
    return newDate;
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

      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Select Appointment Time</h2>
      <p className="text-gray-600 mb-6">
        {isFollowUp ? 'Schedule Follow Up' : `Scheduling with ${closerName}`}
      </p>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setSelectedDate(addDays(selectedDate, -1))}
            className="p-2 hover:bg-gray-100 rounded-full touch-manipulation"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-base sm:text-lg font-medium text-center px-2">
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'long',
              day: 'numeric'
            })}
          </span>
          <button
            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            className="p-2 hover:bg-gray-100 rounded-full touch-manipulation"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
        {loading ? (
          <div className="col-span-full flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#CF7128]"></div>
          </div>
        ) : error ? (
          <div className="col-span-full bg-red-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </div>
        ) : availableSlots.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            No available slots for this date
          </div>
        ) : (
          availableSlots.map((time) => (
          <button
            key={time.toISOString()}
            onClick={() => onSelect(time)}
            className="flex items-center justify-center gap-2 p-2 sm:p-3 border rounded-lg hover:border-[#CF7128] active:bg-[#CF7128]/10 hover:bg-[#CF7128]/5 transition-colors group text-sm sm:text-base touch-manipulation min-h-[44px]"
          >
            <Clock className="h-4 w-4 text-gray-500 group-hover:text-[#CF7128]" />
            <span className="font-medium text-gray-900 group-hover:text-[#CF7128]">
            {formatTimeFunction(time, timeZone)}
            </span>
          </button>
          ))
        )}
      </div>
    </motion.div>
  );
};