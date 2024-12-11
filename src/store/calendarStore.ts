import { create } from 'zustand';

interface CalendarState {
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  availableSlots: Date[];
  setAvailableSlots: (slots: Date[]) => void;
  selectedSlot: Date | null;
  setSelectedSlot: (slot: Date | null) => void;
  calendarId: string | null;
  setCalendarId: (id: string | null) => void;
}

export const useCalendarStore = create<CalendarState>((set) => ({
  selectedDate: null,
  setSelectedDate: (date) => set({ selectedDate: date }),
  availableSlots: [],
  setAvailableSlots: (slots) => set({ availableSlots: slots }),
  selectedSlot: null,
  setSelectedSlot: (slot) => set({ selectedSlot: slot }),
  calendarId: null,
  setCalendarId: (id) => set({ calendarId: id })
}));